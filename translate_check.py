import json, re

data = json.load(open(r'C:\Users\haro\.openclaw\workspace\fp-study\src\data\fp-exam.json','r',encoding='utf-8'))

def has_english(s):
    # Check if string has significant English text (not just numbers/punctuation)
    english_chars = re.findall(r'[a-zA-Z]{2,}', s)
    return len(english_chars) > 0

count = 0
for i, q in enumerate(data):
    if has_english(q['question']):
        count += 1
        print(f"Q{i}: {q['question'][:100]}")
    for j, o in enumerate(q['options']):
        if has_english(o['text']):
            count += 1
            print(f"  O{j}: {o['text'][:100]}")
    if has_english(q.get('explanation','')):
        count += 1

print(f"\nTotal items with English: {count}")
