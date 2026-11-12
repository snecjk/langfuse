import sys
sys.path.insert(0, '/Users/mac/Library/Python/3.9/lib/python3.9/site-packages')
from androguard.core.bytecodes.apk import APK
from androguard.core.bytecodes.dvm import DalvikVMFormat
from androguard.core.analysis.analysis import VMAnalysis

apk = APK('nested/app-release.apk') if False else None
# load raw dex
data=open('nested/classes.dex','rb').read()
dv = DalvikVMFormat(data)
dv.set_decompiler(False)
va = VMAnalysis(dv)
dv.set_vmanalysis(va)

# collect strings with their class/method usage
keywords = ['卡密','卡号','激活','授权','密钥','序列','serial','sign','signature','md5','aes','des','base64','token','license','activate','card','key','校验','验证','生成','加密','解密','secret','appkey','appid']
hits=[]
for s in dv.get_strings():
    sl=s.get_value()
    low=sl.lower()
    if any(k in low for k in keywords):
        hits.append(sl)
print("=== STRING HITS ===")
for h in sorted(set(hits))[:120]:
    print(h)
print("total", len(set(hits)))
