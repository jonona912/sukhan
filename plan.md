1. Add like button          
2. Add comment button       
3. Add delete post button   
4. Add delete user button   
Done forget TDD.           


lsof -i -P -n | grep LISTEN
lsof - list open files
-i (Internet): Tells lsof to only look at network and internet connections (TCP and UDP), ignoring regular files, hard drives, and USB sticks.

-P (Port Numbers): Forces the command to show actual numerical ports (like 80 or 443) instead of translating them into names (like http or https).

-n (No DNS): Prevents the command from trying to turn IP addresses into website names (e.g., it keeps 127.0.0.1 instead of translating it to localhost). This stops the command from making slow network requests, making it run instantly.