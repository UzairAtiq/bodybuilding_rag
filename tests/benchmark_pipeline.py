import argparse
import os
import sys
import time
from typing import Any, Dict, List

# ensure project root is on sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from app.config import QDRANT_URL, QDRANT_API_KEY, GROQ_API_KEY, collection_name
from app.generation.prompt import build_prompt


def get_system_resources() -> Dict[str, str]:
    # collect system cpu and memory stats for diagnostics
    stats = {
        "cpu_count": str(os.cpu_count() or "unknown"),
        "total_ram": "unknown",
        "available_ram": "unknown",
        "swap_used": "unknown",
    }

    try:
        import psutil
        mem = psutil.virtual_memory()
        swap = psutil.swap_memory()
        stats["total_ram"] = f"{mem.total / (1024 ** 3):.2f} GB"
        stats["available_ram"] = f"{mem.available / (1024 ** 3):.2f} GB"
        stats["swap_used"] = f"{swap.used / (1024 ** 3):.2f} GB / {swap.total / (1024 ** 3):.2f} GB"
    except ImportError:
        # fallback to reading /proc/meminfo on linux if psutil is not installed
        meminfo_path = "/proc/meminfo"
        if os.path.exists(meminfo_path):
            try:
                with open(meminfo_path, "r", encoding="utf-8") as f:
                    lines = f.readlines()
                mem_data = {}
                for line in lines:
                    parts = line.split(":")
                    if len(parts) == 2:
                        mem_data[parts[0].strip()] = parts[1].strip()

                total_kb = int(mem_data.get("MemTotal", "0 kB").split()[0])
                avail_kb = int(mem_data.get("MemAvailable", "0 kB").split()[0])
                stats["total_ram"] = f"{total_kb / (1024 ** 2):.2f} GB"
                stats["available_ram"] = f"{avail_kb / (1024 ** 2):.2f} GB"
            except Exception:
                pass

    return stats


def benchmark_single_run(
    query: str,
    embed_model: Any,
    qdrant_client: Any,
    reranker_model: Any,
    llm_client: Any,
    top_k: int = 5,
) -> Dict[str, Any]:
    timings: Dict[str, float] = {}

    # step 1: embed query
    t0 = time.perf_counter()
    query_vector = embed_model.encode(query)
    timings["1_embedding"] = time.perf_counter() - t0

    # step 2: query qdrant cloud
    t0 = time.perf_counter()
    retrieved_points = qdrant_client.query_points(
        collection_name=collection_name,
        query=query_vector,
        with_payload=True,
        limit=top_k,
    ).points
    timings["2_qdrant_retrieval"] = time.perf_counter() - t0

    # step 3: cross-encoder reranking
    pairs = [(query, pt.payload.get("text", "")) for pt in retrieved_points]
    total_chars = sum(len(text) for _, text in pairs)

    t0 = time.perf_counter()
    scores = reranker_model.predict(pairs)
    timings["3_reranker_inference"] = time.perf_counter() - t0

    # sort top 2 reranked chunks
    ranked = sorted(zip(retrieved_points, scores), key=lambda x: x[1], reverse=True)
    top_chunks = [pt for pt, _ in ranked[:2]]

    # step 4: build prompt
    t0 = time.perf_counter()
    prompt_text = build_prompt(query, top_chunks)
    timings["4_prompt_building"] = time.perf_counter() - t0

    # step 5: llm invocation
    t0 = time.perf_counter()
    llm_response = llm_client.invoke(prompt_text)
    timings["5_llm_generation"] = time.perf_counter() - t0

    timings["total_pipeline"] = sum(timings.values())

    return {
        "timings": timings,
        "retrieved_count": len(retrieved_points),
        "reranked_count": len(top_chunks),
        "total_chunk_characters": total_chars,
        "answer_preview": str(getattr(llm_response, "content", llm_response))[:160] + "...",
    }


def print_report(run_name: str, result: Dict[str, Any]) -> None:
    timings = result["timings"]
    total = timings["total_pipeline"]

    print("\n" + "=" * 65)
    print(f"📊 BENCHMARK RESULTS: {run_name}")
    print("=" * 65)
    print(f"Retrieved Chunks : {result['retrieved_count']}")
    print(f"Total Text Size  : {result['total_chunk_characters']} characters ({result['total_chunk_characters'] // 4} approx tokens)")
    print("-" * 65)
    print(f"{'Stage / Component':<32} {'Latency (sec)':<16} {'Share (%)':<10}")
    print("-" * 65)

    stage_labels = [
        ("1_embedding", "1. Query Embedding (all-MiniLM)"),
        ("2_qdrant_retrieval", "2. Qdrant Vector Search"),
        ("3_reranker_inference", "3. Cross-Encoder Rerank"),
        ("4_prompt_building", "4. Prompt Construction"),
        ("5_llm_generation", "5. Groq LLM Generation"),
    ]

    for key, label in stage_labels:
        duration = timings.get(key, 0.0)
        percentage = (duration / total * 100.0) if total > 0 else 0.0
        flag = " ⚠️ BOTTLENECK" if duration > 10.0 else ""
        print(f"{label:<32} {duration:>8.3f}s        {percentage:>5.1f}%{flag}")

    print("-" * 65)
    print(f"{'TOTAL PIPELINE LATENCY':<32} {total:>8.3f}s        100.0%")
    print("=" * 65)
    print(f"LLM Preview: {result['answer_preview']}\n")


def diagnose_bottlenecks(timings: Dict[str, float], sys_info: Dict[str, str]) -> None:
    rerank_time = timings.get("3_reranker_inference", 0.0)
    llm_time = timings.get("5_llm_generation", 0.0)
    qdrant_time = timings.get("2_qdrant_retrieval", 0.0)
    total_time = timings.get("total_pipeline", 0.0)

    print("🔎 DIAGNOSTIC ANALYSIS:")
    print("-" * 65)

    if total_time < 5.0:
        print("✅ Pipeline performance is fast and within normal ranges (<5 seconds).")
        return

    if rerank_time > 15.0 or (rerank_time / total_time > 0.5):
        print(f"🚨 PRIMARY CAUSE: Cross-Encoder Reranker took {rerank_time:.2f}s ({rerank_time/total_time*100:.1f}% of total time)!")
        print("   Explanation:")
        print("   - 'tomaarsen/reranker-ModernBERT-base-gooaq-bce' is a 149M parameter transformer.")
        print(f"   - On a cloud CPU instance ({sys_info.get('cpu_count', '1')} vCPU, {sys_info.get('available_ram', '')} RAM available),")
        print("     running neural network inference on 5 full text chunks causes high CPU load and heavy latency.")
        if "swap" in sys_info.get("swap_used", "") and sys_info["swap_used"] != "unknown":
            print(f"   - Swap activity detected ({sys_info['swap_used']}): if RAM is saturated, OS disk thrashing adds severe delays.")
        print("   Recommended Fixes:")
        print("   1. Switch to a lightweight reranker: 'cross-encoder/ms-marco-MiniLM-L-6-v2' (approx 5-10x faster on CPU).")
        print("   2. Reduce retrieved chunks: lower top_k from 5 to 3.")
        print("   3. Or truncate chunk length before passing to reranker (e.g. first 256 tokens).")

    if llm_time > 15.0 or (llm_time / total_time > 0.5):
        print(f"⚠️ SECONDARY CAUSE: Groq LLM API generation took {llm_time:.2f}s.")
        print("   Explanation:")
        print("   - 'openai/gpt-oss-120b' on Groq or network latency to Groq endpoints took significant time.")
        print("   - Check if Groq rate limits or queuing are delaying the response, or consider 'llama-3.3-70b-versatile'.")

    if qdrant_time > 5.0:
        print(f"⚠️ NETWORK LATENCY: Qdrant Cloud query took {qdrant_time:.2f}s.")
        print("   Explanation:")
        print("   - Check EC2 instance outbound network connectivity or Qdrant cluster geographic location.")

    print("=" * 65 + "\n")


def main() -> None:
    parser = argparse.ArgumentParser(description="Profile latency bottlenecks in Muscle Info RAG pipeline.")
    parser.add_argument(
        "--query",
        type=str,
        default="What are the best chest exercises according to Joe Weider?",
        help="Query to benchmark.",
    )
    args = parser.parse_args()

    print("\n" + "=" * 65)
    print("🚀 MUSCLE INFO RAG - LATENCY PROFILER & DIAGNOSTIC TOOL")
    print("=" * 65)

    # 1. system resource check
    sys_info = get_system_resources()
    print("🖥️  System Environment:")
    print(f"   - CPU Cores     : {sys_info['cpu_count']}")
    print(f"   - Total RAM     : {sys_info['total_ram']}")
    print(f"   - Available RAM : {sys_info['available_ram']}")
    print(f"   - Swap Usage    : {sys_info['swap_used']}")
    print("-" * 65)

    # 2. initialize models with timing
    print("⏳ Loading models into memory (cold start measurement)...")

    t0 = time.perf_counter()
    from sentence_transformers import SentenceTransformer
    embed_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    embed_load_time = time.perf_counter() - t0
    print(f"   - Embedding Model (all-MiniLM-L6-v2) loaded in {embed_load_time:.2f}s")

    t0 = time.perf_counter()
    from qdrant_client import QdrantClient
    qdrant_client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
    qdrant_init_time = time.perf_counter() - t0
    print(f"   - Qdrant Cloud Client initialized in {qdrant_init_time:.2f}s")

    t0 = time.perf_counter()
    from sentence_transformers import CrossEncoder
    reranker_model = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2", max_length=384)
    rerank_load_time = time.perf_counter() - t0
    print(f"   - Reranker Model (ms-marco-MiniLM-L-6-v2) loaded in {rerank_load_time:.2f}s")

    t0 = time.perf_counter()
    from langchain_groq import ChatGroq
    llm_client = ChatGroq(model="openai/gpt-oss-120b", temperature=0.7, api_key=GROQ_API_KEY)
    llm_init_time = time.perf_counter() - t0
    print(f"   - Groq Client initialized in {llm_init_time:.2f}s")

    # 3. run first benchmark (cold execution)
    print("\n🏃 Executing Run 1 (Cold Execution)...")
    run1 = benchmark_single_run(args.query, embed_model, qdrant_client, reranker_model, llm_client)
    print_report("Run 1 (Cold Execution)", run1)

    # 4. run second benchmark (warm execution)
    print("🏃 Executing Run 2 (Warm Execution - Identical to subsequent user requests)...")
    run2 = benchmark_single_run(args.query, embed_model, qdrant_client, reranker_model, llm_client)
    print_report("Run 2 (Warm Execution)", run2)

    # 5. provide bottleneck diagnosis
    diagnose_bottlenecks(run2["timings"], sys_info)


if __name__ == "__main__":
    main()
