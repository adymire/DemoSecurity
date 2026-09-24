mujhe ye ek repo banni hai or ye open sourcse rhegi ye repo is trike se banni hai isko kisi bhi platforme pr lgaya ja ske iski bhi language ke sath intigration kiya ja ske , web ke liye hai jese ki bahut sare users hote hai wo fake sing login krte hai unko blcok etc krne ke liya bnaya jayega ye repo isme docs bhi bnao redme ko upldate kro acchese and is repo ko complete bnao mern web devlopemtn baceklnd ke liye best rhega type script mai bante hai fi is repo ke clone baad mai ge alag alag beckend ke hsiab se abhi mern pr node or nest ye kisme best rhega -- अब हम CyberFallen के Frontend के Starting से होने वाली सभी Auth एन्ड सभी Onboarding के process को Real बनाना है & सभी को DB में Update करना है।

Google & Github Auth के लिए Backend में Real Key Credials लगाने है जिसे User Login और SignUp कर सके। अगर User Exit है तो उसे Login कराओ Bese Auth है तो User Exits की जरूरत नही है google & Github Auth Real बनाओ & DB में पूरा onboarding का Data Update करो

DB से Data Admin में fetch कराओ जो New User Create हुआ है जिसे इस User से Reled Info Admin में दिख सके।

अब हम Platforms के अन्दर Real सब कुछ करेंगे जो User की gmaiL or Github है उससे उसके profile में और User Dropdown में दिखाता हर जगह -

USER की Chats - AI Chat / Coding Chat / Agent chat अभी Local पर रहेगी क्योकि अभी हम Desktop Version Release कर रहे है Web App नहीं तो Desktop Version पर इसके Chats को Local पर सही से Mange करो । Desktop App का Installr Pross GUI बनाओ अच्छे से इसको Window , MacOs , Linux सब के लिए optimize करो -


(2)
Brain को अन्दर से Installin के समय Sequre करना जिससे Local पर उसका Code कोई देख ना ले।

अब Payment process पर आते है जैसे ही कोई Payment Billing पर Clik करेगा और plans पर click करेगा wo Defallt Browsers में Redirect हो जाये Desktop App से जिसे wo payment cut कर सके और जैसे ही payment Done हो वैसे ही Window Close हो जाये और User Back आ जाये Platfore Desktop App पर और payment Done हो जाये - payment Done होने पर Backend से Restriction Remove हो जाये जो हम Plans के set करेंगे कि किस plan के us user कितना use कर पायेगा या free में कितना use कर पायेगा उस हिसाब से उसका Usage बन पाये । payment syces Platfrome दिये और DB में upadte हो और DB से Auto fetch हो Admin के पास जहाँ पर payment Relete काम है।


(3) ~Fake user & Backend~
Backend में Microservises Add करनी है Backend को Decid करे कि prompts किसे Handle कराना है APIs को Load Balancur लगाना है अच्छे User Accoun + को अच्छे से Mange करना है। Gaph QL अगर लगाना है तो लगाओ इसका Flow होगा

[Desktop APP] ---> prompt ---> [Locla पर Brain] ---> Web socket ---> [Backend] ---> [LLM API]

इस तरीके से prompt का Flow है लेकिन यहाँ पर Lopp Enginering है तो Loop भी चलेगा जैसे User ने prompt दिया तो एक prompt के बाद Loop चलता रहेगा Socket Connection से Fronted से जो काम होगा हमको Fronted पर दिखेगा।

Payments & plans का Controls Admin से Update हो तो Fronted के Chanes हो Admin में Aler बनाओ जो कि हम कभी भी कोई भी New Upated Annoucm बना सके Platfome पर


(4) Fake User Sequrity

ये Algorithm ऐसे काम करता है

ये Auth से DB से Reled होगा -

जैसे ही User Frist time Account बनायेगा इसके Account के साथ-साथ हमे इसकी

IP Address , Browler IP, wifi Route IP,

Device IP , Country map Loction

Account ID जो Create हुआ है

अब fake User से कैसे बचना है

जब User SignUp करेगा Install करके ये Sab Capture होगा end DB में सेव होगा -

इसके बाद अगर User Free में Use करके Spam करेगा या New gmail या github से SignUp करेगा तो Same Device है या कुछ भी Sanal Detect हो previous DB से उसके उसकी Previous Login Detel के बारे में popup दिखाओ user xx xxx* 32 @ gmail इस तरीके से Sequre, जिसे User को पता पडे की wo spam नहीं कर सकता उसे बस gmail Change करने का option दे सकते है बस Account Ek ही रहेगा।

gmail या github change करेगा Credit में कोई Change नहीं होगा जैसे हम temmail ek fraud से बच जायेगे और उसको Ek alert Instruction दो इसके तीन तरीके के Account Suspention बनाओ admin और Backend में , Permanent Blocked, temproury Block, Restrict till 2 Day Recouly Now
