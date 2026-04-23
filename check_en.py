import json, re

data=json.load(open(r'C:\Users\haro\.openclaw\workspace\fp-study\src\data\fp-exam.json','r',encoding='utf-8'))

def has_en(s):
    return len(re.findall(r'[a-zA-Z]{3,}', s)) > 0

issues = 0
for i,q in enumerate(data):
    if has_en(q['question']):
        issues += 1
        print('EN Q%d: %s' % (i, q['question'][:80]))
    for j,o in enumerate(q['options']):
        if has_en(o['text']):
            issues += 1
            print('EN O%d-%d: %s' % (i, j, o['text'][:80]))

print('Total issues: %d' % issues)
