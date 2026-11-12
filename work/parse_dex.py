import struct, sys

def read_strings(data, off, size):
    outs=[]
    for i in range(size):
        soff=struct.unpack_from("<I", data, off+i*4)[0]
        p=soff
        l=0; shift=0
        while True:
            b=data[p]; p+=1
            l |= (b & 0x7f) << shift
            if not (b & 0x80): break
            shift += 7
        s=data[p:p+l].decode('utf-8','replace')
        outs.append(s)
    return outs

def parse(path):
    data=open(path,'rb').read()
    magic=data[0:8]
    assert magic.startswith(b'dex'), path
    # header fields
    stringIdsSize,=struct.unpack_from("<I", data, 0x38)
    stringIdsOff,=struct.unpack_from("<I", data, 0x3C)
    typeIdsSize,=struct.unpack_from("<I", data, 0x40)
    typeIdsOff,=struct.unpack_from("<I", data, 0x44)
    classDefsSize,=struct.unpack_from("<I", data, 0x60)
    classDefsOff,=struct.unpack_from("<I", data, 0x64)
    strings=read_strings(data, stringIdsOff, stringIdsSize)
    types=[]
    for i in range(typeIdsSize):
        si=struct.unpack_from("<I", data, typeIdsOff+i*4)[0]
        types.append(strings[si])
    print(f"== {path} == classes={classDefsSize}")
    for i in range(classDefsSize):
        c=classDefsOff+i*44
        classIdx,accessFlags,superclassIdx,interfacesOff,sourceFileIdx=struct.unpack_from("<IIIII", data, c)
        si=classIdx
        ti=superclassIdx
        cn = types[si] if si < len(types) else f'IDX{si}'
        sn = types[ti] if ti < len(types) else f'IDX{ti}'
        src = strings[sourceFileIdx] if sourceFileIdx != 0xFFFFFFFF else ''
        print(f"  {cn}  <- {sn}  src={src}")

for p in sys.argv[1:]:
    parse(p)
