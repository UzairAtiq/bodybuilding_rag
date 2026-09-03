from app.pipeline import pipeline
import json
import time

questions = [
    "How should a beginner break into a weight training program to avoid soreness or injury?",
    "What is the recommended number of sets to perform during the first week and first month of training?",
    "What muscles do bench presses primarily work?",
    "How many sets and reps are prescribed for bench presses in Chart 4's Monday upper body workout?",
    "What is the correct starting position for close-grip bench presses?",
    "What is emphasized when performing lateral raises with bent arms and rotated hands?",
    "What exercises are grouped as supersets in the Monday upper body workout?",
    "What muscles are targeted by close-grip bench presses?",
]
#Debugging flag for pipeline
debug = True

def run_evaluation():
    results = []

    print("Running Questions")

    for i , question in enumerate (questions):
        print(f"Running: {question}")
        answer, chunk_info = pipeline(question, debug=True)

        results.append({
            "question": question,
            "answer": answer,
            "retrieved_chunks": chunk_info
        })

        #Pausing for 80 seconds after 4 questions due to groks rate limit per minute
        if (i + 1) % 1 == 0:
          print("Pausing to respect rate limit...")
          time.sleep(30)

    print("Results Written")

    with open("/Users/uzair/Developer/Muscle_Info_RAG/data/evaluation/evaluate.json", "w") as f:
        json.dump(results, f, indent=2)

    print("Evaluation complete. Results written to data/evaluation/evaluate.json")


run_evaluation()




  
  