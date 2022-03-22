# Media Server 속성 설치 방법

아래 방법은 AWS EC2 Ubuntu 20.04에서 테스트되었습니다. 보다 안정적으로 작동시키기 위해서 정식 SSL 인증서를 설치하시거나, 보다 간단하게는 Cloudflare를 이용하시기 바랍니다.

1. EC2 instance 생성 후 UDP port를 40000-49999까지 열어줍니다.
2. HTTP port(80), HTTPS port(443)을 열어줍니다.
3. 아래의 명령어를 이용하여 80번 포트로 들어온 traffic을 8000번 포트로 포트포워딩 해줍니다.
```
sudo iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8000
```
4. 아래의 명령어로 Media server 실행에 필요한 모든 디펜던시를 설치해줍니다.
````sh
./install_dependency.sh
````
5. config.js 파일에서 `announcedIp`라는 key 값의 value를 EC2 instance의 public IP 주소로 바꿔줍니다.
6. `node src/app.js`로 미디어 서버를 실행시켜줍니다. (터미널 끄고도 계속 서버가 돌아가게 하고 싶다면 `nohup node src/app.js & disown`도 하나의 옵션입니다.)