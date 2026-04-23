import json, re

data=json.load(open(r'C:\Users\haro\.openclaw\workspace\fp-study\src\data\fp-exam.json','r',encoding='utf-8'))

# Words that should remain in English
OK_WORDS = {'NISA','iDeCo','GDP','ETF','REIT','NAV','YTM','LTV','NOI','DSCR','VaR','CPI','TOPIX','FSA',
'JASDEC','SESC','AML','NASDAQ','FIRE','MMF','TB','FX','JGB','QC','JREIT','QE','BOJ','ROI','ROE',
'DB','DC','RC','HEARTBEAT_OK','outstanding'}

def has_unwanted_en(s):
    # Find English words of 3+ chars that are NOT in OK_WORDS
    words = re.findall(r'[a-zA-Z]{3,}', s)
    bad = [w for w in words if w not in OK_WORDS]
    return bad

issues = 0
with open(r'C:\Users\haro\.openclaw\workspace\fp-study\check_results.txt','w',encoding='utf-8') as f:
    for i,q in enumerate(data):
        bad = has_unwanted_en(q['question'])
        if bad:
            issues += 1
            f.write('Q%d [%s]: %s -> bad: %s\n' % (i, q['category'], q['question'][:60], bad))
        for j,o in enumerate(q['options']):
            bad = has_unwanted_en(o['text'])
            if bad:
                issues += 1
                f.write('  O%d-%d: %s -> bad: %s\n' % (i, j, o['text'][:60], bad))
    f.write('\nTotal issues: %d\n' % issues)

print('Done. Check check_results.txt')
