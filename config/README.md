# Configuration

## Keys

```sh
openssl ecparam -genkey \
    -name secp521r1 \
    -out jws.secp521r1.key
openssl pkey -pubout \
  -in jws.secp521r1.key \
  -out jws-public.secp521r1.key
```
