import json

data=json.load(open(r'C:\Users\haro\.openclaw\workspace\fp-study\src\data\fp-exam.json','r',encoding='utf-8'))
with open(r'C:\Users\haro\.openclaw\workspace\fp-study\dump.txt','w',encoding='utf-8') as f:
    for i,q in enumerate(data):
        f.write(f'--- Q{i} [{q["category"]}] ---\n')
        f.write(f'Q: {q["question"]}\n')
        for j,o in enumerate(q['options']):
            f.write(f'  {j}: {o["text"]}\n')
        f.write(f'E: {q.get("explanation","?")}\n\n')
print('done')
