from datasets import load_dataset

clinc = load_dataset("DeepPavlov/clinc150")
hwu = load_dataset("DeepPavlov/hwu64")

print("CLINC150:")
print(clinc)

print("\nHWU64:")
print(hwu)