/* Namaz Board: Bangla translations.
   DICT: exact text → Bangla.  RULES: patterns for sentences with numbers, times or names.
   To fix a translation, edit the Bangla side here. */
(() => {
const W = {"Fajr":"ফজর","Dhuhr":"যোহর","Asr":"আসর","Maghrib":"মাগরিব","Isha":"এশা","Sunrise":"সূর্যোদয়","Ishraq & Duha":"ইশরাক ও দুহা","Tahajjud time":"তাহাজ্জুদের সময়"};
const w = s => W[s] || s;
const dur = s => s.replace(/(\d+)h/g, "$1ঘ").replace(/(\d+)m\b/g, "$1মি");

const DICT = {
  // navigation & header
  "Today":"আজ","Board":"বোর্ড","Me":"আমি","Yesterday":"গতকাল","Assalamu alaikum ✨":"আসসালামু আলাইকুম ✨",
  // waqt names
  ...W, "Dhuhr / Jumu'ah":"যোহর / জুমা","Tahajjud & extra":"তাহাজ্জুদ ও অন্যান্য",
  // sky
  "Last third of the night · best time for tahajjud":"রাতের শেষ তৃতীয়াংশ · তাহাজ্জুদের উত্তম সময়",
  "I prayed ✓":"পড়েছি ✓",
  // streak card
  "Start a streak":"স্ট্রিক শুরু করুন","Streak paused":"স্ট্রিক বিরতিতে",
  "All 5 fardh done today. Your streak is safe.":"আজ পাঁচ ওয়াক্ত ফরজই পড়া হয়েছে। আপনার স্ট্রিক নিরাপদ।",
  "Pray all 5 fardh in a day to light the flame.":"এক দিনে পাঁচ ওয়াক্ত ফরজ পড়ে আগুন জ্বালান।",
  "Today is excused, so your streak is paused, not broken. Only you can see this.":"আজকের দিনটি ছাড় দেওয়া, তাই স্ট্রিক থেমে আছে, ভাঙেনি। এটা শুধু আপনি দেখতে পান।",
  "🌍 Public":"🌍 পাবলিক","🔒 Private":"🔒 প্রাইভেট","Make private? Tap again":"প্রাইভেট করবেন? আবার চাপুন","Make public? Tap again":"পাবলিক করবেন? আবার চাপুন",
  "Fardh since you joined":"যোগ দেওয়ার পর থেকে ফরজ","Your first fardh will show here.":"আপনার প্রথম ফরজ এখানে দেখাবে।","Since joining":"যোগ দেওয়ার পর থেকে","All":"সব",
  "Everyone's streaks":"সবার স্ট্রিক","Ring = today's fardh":"রিং = আজকের ফরজ","You":"আপনি","you":"আপনি",
  // today list
  "Today's namaz":"আজকের নামাজ","Yesterday's namaz":"গতকালের নামাজ",
  "⏸ Can't pray today? Excuse this day":"⏸ আজ পড়তে পারছেন না? দিনটি ছাড় দিন",
  "⏸ Can't pray yesterday? Excuse this day":"⏸ গতকাল পড়তে পারেননি? দিনটি ছাড় দিন",
  "Pause streak for this day? Tap again":"এই দিনের স্ট্রিক থামাবেন? আবার চাপুন",
  "Excused today.":"আজ ছাড় দেওয়া।","Excused yesterday.":"গতকাল ছাড় দেওয়া।",
  "Your streak is paused, not broken. Only you can see this.":"স্ট্রিক থেমে আছে, ভাঙেনি। এটা শুধু আপনি দেখতে পান।","Undo":"ফিরিয়ে নিন",
  "Fardh":"ফরজ","Fardh prayed":"ফরজ পড়া হয়েছে","Sunnah":"সুন্নত","Nafl":"নফল","Witr":"বিতর","Tahajjud":"তাহাজ্জুদ","Ishraq":"ইশরাক","Duha":"দুহা","Awwabin":"আওয়াবিন",
  "MashaAllah ✨":"মাশাআল্লাহ ✨","Upcoming":"আসছে","Locked":"বন্ধ","Not logged":"লগ করা হয়নি",
  "Prayed Jumu'ah? Tap Fardh, it counts for Dhuhr.":"জুমা পড়েছেন? ফরজ চাপুন, এটি যোহর হিসেবে গণ্য হবে।",
  "Each namaz can be logged for 24 hours after its waqt begins. Only fardh counts toward your streak.":"প্রতিটি নামাজ ওয়াক্ত শুরুর পর ২৪ ঘণ্টা পর্যন্ত লগ করা যায়। স্ট্রিকে শুধু ফরজ গণ্য হয়।",
  "Get a ping for every namaz":"প্রতি ওয়াক্তে নোটিফিকেশন পান",", even when your phone is locked.":", ফোন লক থাকলেও।","Set up":"চালু করুন","Later":"পরে",
  "Review":"দেখুন",
  // board
  "🌍 Everyone":"🌍 সবাই","＋ New group":"＋ নতুন গ্রুপ","＋ Join a group":"＋ গ্রুপে যোগ দিন","Invite":"আমন্ত্রণ","Manage":"পরিচালনা","Info":"তথ্য",
  "As long as the shortest streak in the group. Keep each other going!":"গ্রুপের সবচেয়ে ছোট স্ট্রিকের সমান। একে অপরকে উৎসাহ দিন!",
  "Starts when everyone has a streak going.":"সবার স্ট্রিক চালু হলে শুরু হবে।",
  "Last 7 days":"গত ৭ দিন","This month":"এই মাস","7 days":"৭ দিন","Month":"মাস","1st":"১ম","2nd":"২য়","3rd":"৩য়",
  "Ranked by fardh prayed out of fardh due. Excused days never count against anyone, and nobody can see them.":"যত ওয়াক্ত ফরজ বাকি ছিল তার মধ্যে কত পড়া হয়েছে, সেই অনুযায়ী ক্রম। ছাড় দেওয়া দিন কারো বিপক্ষে গণ্য হয় না, আর কেউ তা দেখতেও পায় না।",
  "This group shares streaks and grades only, so daily details stay private.":"এই গ্রুপে শুধু স্ট্রিক আর গ্রেড দেখা যায়, দৈনিক বিস্তারিত গোপন থাকে।",
  "Only streaks and grades are shared here, so daily details stay private.":"এখানে শুধু স্ট্রিক আর গ্রেড দেখা যায়, দৈনিক বিস্তারিত গোপন থাকে।",
  "Nobody is public yet.":"এখনো কেউ পাবলিক নয়।","Go public":"পাবলিক হোন",
  "You're private":"আপনি প্রাইভেট",", so you're hidden from this board. Your groups still see your record.":", তাই এই বোর্ডে আপনাকে দেখা যায় না। আপনার গ্রুপগুলো এখনো আপনার রেকর্ড দেখে।",
  "Your namaz is private 🔒":"আপনার নামাজ প্রাইভেট 🔒",
  "Nobody can see your log until you're in a group. Create one and share its link, or join a friend's group with their code.":"গ্রুপে না থাকা পর্যন্ত কেউ আপনার লগ দেখতে পায় না। একটি গ্রুপ বানিয়ে লিংক শেয়ার করুন, অথবা বন্ধুর কোড দিয়ে তার গ্রুপে যোগ দিন।",
  "Create a group":"গ্রুপ বানান","Join with code":"কোড দিয়ে যোগ দিন",
  "New group 🌸":"নতুন গ্রুপ 🌸","Name":"নাম","What members can see":"সদস্যরা কী দেখতে পাবে",
  "🔥 Streaks only":"🔥 শুধু স্ট্রিক","📖 Full details":"📖 সম্পূর্ণ বিস্তারিত",
  "Streaks, grades and points. No daily details. Best for mixed or bigger groups.":"স্ট্রিক, গ্রেড আর পয়েন্ট। দৈনিক বিস্তারিত নয়। মিশ্র বা বড় গ্রুপের জন্য ভালো।",
  "Also today's rings, gradesheets and calendars. Best for close friends.":"সাথে আজকের রিং, গ্রেডশিট আর ক্যালেন্ডারও। কাছের বন্ধুদের জন্য ভালো।",
  "No daily details.":"দৈনিক বিস্তারিত নয়।","Rings, gradesheets and calendars too.":"রিং, গ্রেডশিট আর ক্যালেন্ডারও।",
  "Create":"বানান","Cancel":"বাতিল","Join a group":"গ্রুপে যোগ দিন",
  "Ask a friend for their group's 6-letter code, or open the invite link they sent.":"বন্ধুর কাছ থেকে গ্রুপের ৬ অক্ষরের কোড নিন, অথবা তার পাঠানো লিংক খুলুন।",
  "Group code":"গ্রুপ কোড","Join":"যোগ দিন","Manage group":"গ্রুপ পরিচালনা","Save":"সেভ করুন","Members":"সদস্য","Remove":"বাদ দিন","Tap to confirm":"নিশ্চিত করতে চাপুন",
  "Delete group":"গ্রুপ মুছুন","Tap again to delete the group":"গ্রুপ মুছতে আবার চাপুন","Leave group":"গ্রুপ ছাড়ুন","Tap again to leave":"ছাড়তে আবার চাপুন",
  // gradesheet & me
  "Waqt":"ওয়াক্ত","Grade":"গ্রেড","Last 12 weeks":"গত ১২ সপ্তাহ","5 fardh":"৫ ফরজ",
  "Fardh, 7 days":"ফরজ, ৭ দিন","Best streak":"সেরা স্ট্রিক","Points this month":"এ মাসের পয়েন্ট","Hanafi Asr":"হানাফি আসর","Standard Asr":"সাধারণ আসর",
  "Badges":"ব্যাজ","Earned by praying all 5 fardh for days in a row. Your best streak: ":"পরপর অনেক দিন পাঁচ ওয়াক্ত ফরজ পড়ে অর্জন করুন। আপনার সেরা স্ট্রিক: ",
  "One week":"এক সপ্তাহ","40 days":"৪০ দিন","100 days":"১০০ দিন","One year":"এক বছর","Earned":"অর্জিত",
  "Qaza 🔒":"কাজা 🔒","Keep count of missed prayers you're making up. Only you can see this.":"যে নামাজগুলো কাজা আদায় করছেন তার হিসাব রাখুন। এটা শুধু আপনি দেখতে পান।",
  "Missed":"বাকি","All made up ✨":"সব আদায় হয়েছে ✨","✓ Made one up":"✓ একটি আদায় করেছি",
  "Enter how many of each you owe, then tap ":"প্রতিটির কতগুলো বাকি লিখুন, তারপর প্রতিবার একটি আদায় করলে ","Made one up":"একটি আদায় করেছি"," each time you pray one.":" চাপুন।",
  // settings
  "Your settings":"আপনার সেটিংস","Join the board 🌸":"বোর্ডে যোগ দিন 🌸",
  "Namaz times are worked out for your own city, so each person can be somewhere different.":"নামাজের সময় আপনার শহর অনুযায়ী হিসাব হয়, তাই সবাই আলাদা জায়গায় থাকতে পারে।",
  "Name on the board":"বোর্ডে নাম","City":"শহর","Asr time":"আসরের সময়","Hanafi (later)":"হানাফি (পরে)","Standard (earlier)":"সাধারণ (আগে)","Fajr & Isha method":"ফজর ও এশার পদ্ধতি",
  "📍 Use my location":"📍 আমার লোকেশন ব্যবহার করুন",
  "Optional. Exact times for where you are. Your position is rounded to about 10 km.":"ঐচ্ছিক। আপনি যেখানে আছেন তার সঠিক সময়। আপনার অবস্থান প্রায় ১০ কিমি পর্যন্ত গোল করা হয়।",
  "Finding you…":"খুঁজছি…","Location wasn't shared. Pick your city from the list instead.":"লোকেশন শেয়ার করা হয়নি। তালিকা থেকে শহর বেছে নিন।",
  "Picking a city also picks the usual method there. You can still change it.":"শহর বাছলে সেখানকার প্রচলিত পদ্ধতিও বাছা হয়। চাইলে বদলাতে পারেন।",
  "Everyone board":"সবার বোর্ড",
  "I'm on the Everyone board: all Namaz Board users see my streak, grade and today's fardh. My groups see me too.":"আমি সবার বোর্ডে আছি: সব ব্যবহারকারী আমার স্ট্রিক, গ্রেড ও আজকের ফরজ দেখে। আমার গ্রুপও দেখে।",
  "I'm hidden from the Everyone board. My groups still see my record.":"সবার বোর্ডে আমাকে দেখা যায় না। আমার গ্রুপ এখনো আমার রেকর্ড দেখে।",
  "Show my sunnah, nafl and tahajjud to my groups":"আমার গ্রুপকে আমার সুন্নত, নফল ও তাহাজ্জুদ দেখান",
  "✨ How Namaz Board works":"✨ নামাজ বোর্ড কীভাবে কাজ করে","Privacy":"গোপনীয়তা","Sign out":"সাইন আউট","Delete my account":"আমার অ্যাকাউন্ট মুছুন","Tap again: delete everything":"আবার চাপুন: সব মুছে যাবে",
  "Language":"ভাষা","No Gmail?":"Gmail নেই?","Sign up without email":"ইমেইল ছাড়া সাইন আপ করুন","Signed up without email before?":"আগে ইমেইল ছাড়া সাইন আপ করেছেন?","Sign in with your Namaz Board code":"নামাজ বোর্ড কোড দিয়ে সাইন ইন করুন",
  "No email or Google needed. Instead, we'll give you a":"ইমেইল বা Google লাগবে না। বদলে আপনি পাবেন একটি","Namaz Board code":"নামাজ বোর্ড কোড",": your own secret key for signing in.":": সাইন ইন করার জন্য আপনার নিজের গোপন চাবি।",
  "⚠️ Your account is saved on":"⚠️ আপনার অ্যাকাউন্ট সেভ থাকবে","this device":"এই ডিভাইসে",
  ". If you change phones or clear your browser, you'll need your Namaz Board code to get back in. Lose the code, and your streak can't be recovered.":"। ফোন বদলালে বা ব্রাউজার মুছলে আবার ঢুকতে ব্যাকআপ কোড লাগবে। কোড হারালে স্ট্রিক আর ফেরত পাওয়া যাবে না।",
  "Create my account":"অ্যাকাউন্ট বানান","Creating…":"বানানো হচ্ছে…","Back":"ফিরে যান","Sign in with your code 🔑":"কোড দিয়ে সাইন ইন করুন 🔑","Type the Namaz Board code you were given when you signed up. It starts with NB.":"সাইন আপের সময় পাওয়া নামাজ বোর্ড কোডটি লিখুন। এটি NB দিয়ে শুরু।",
  "Sign in":"সাইন ইন","🔑 Save your Namaz Board code":"🔑 নামাজ বোর্ড কোড সেভ করুন","🔑 Your Namaz Board code":"🔑 আপনার নামাজ বোর্ড কোড",
  "This is the only way back into your account on a new phone, or if this browser's data is cleared. Screenshot it or save it somewhere safe.":"নতুন ফোনে বা ব্রাউজারের ডেটা মুছে গেলে অ্যাকাউন্টে ফেরার এটাই একমাত্র উপায়। স্ক্রিনশট নিন বা নিরাপদ জায়গায় রাখুন।",
  "Use it to sign in on another phone or after clearing this browser.":"অন্য ফোনে বা ব্রাউজার মোছার পর সাইন ইন করতে এটি ব্যবহার করুন।","Copy":"কপি","I've saved it ✓":"সেভ করেছি ✓",
  "This browser doesn't have your code saved. Make a new one so you can always get back in. Your old code will stop working.":"এই ব্রাউজারে আপনার কোড সেভ নেই। নতুন একটি বানান, যাতে সবসময় ফিরতে পারেন। পুরনো কোড আর কাজ করবে না।",
  "Make a new code":"নতুন কোড বানান","Tap again: old code stops working":"আবার চাপুন: পুরনো কোড বন্ধ হবে","Saved your Namaz Board code? Tap again":"নামাজ বোর্ড কোড সেভ করেছেন? আবার চাপুন",
  "Code copied ✓":"কোড কপি হয়েছে ✓","New code ready. Save it somewhere safe 🔑":"নতুন কোড তৈরি। নিরাপদে রাখুন 🔑",
  "That code didn't work. Check it and try again.":"কোডটি কাজ করেনি। দেখে আবার চেষ্টা করুন।","That code doesn't look right. It has 20 letters and numbers after NB.":"কোডটি ঠিক মনে হচ্ছে না। NB-এর পরে ২০টি অক্ষর ও সংখ্যা থাকে।",
  "Couldn't create an account right now. Try again in a minute.":"এখন অ্যাকাউন্ট বানানো যাচ্ছে না। এক মিনিট পরে চেষ্টা করুন।","Couldn't make a new code. Try again.":"নতুন কোড বানানো যায়নি। আবার চেষ্টা করুন।","You're inside another app's browser.":"আপনি অন্য অ্যাপের ব্রাউজারে আছেন।","Google sign-in, installing and alerts won't work here. Open it in Chrome instead.":"এখানে Google সাইন ইন, ইনস্টল আর অ্যালার্ট কাজ করবে না। Chrome-এ খুলুন।","Open in Chrome":"Chrome-এ খুলুন",
  "Google sign-in, installing and alerts won't work here. Tap":"এখানে Google সাইন ইন, ইনস্টল আর অ্যালার্ট কাজ করবে না।","or the share icon, then":"বা শেয়ার আইকনে চাপুন, তারপর","Open in Safari":"Safari-তে খুলুন","📲":"📲","Install Namaz Board":"নামাজ বোর্ড ইনস্টল করুন","as an app on this phone.":"এই ফোনে অ্যাপ হিসেবে।","Install":"ইনস্টল","Installed 🎉 Open Namaz Board from your home screen.":"ইনস্টল হয়েছে 🎉 হোম স্ক্রিন থেকে নামাজ বোর্ড খুলুন।","Picking a city also picks the usual method there. You can still change it.":"শহর বাছলে সেখানকার প্রচলিত পদ্ধতিও বাছা হয়। চাইলে বদলাতে পারেন।","City not listed?":"শহর তালিকায় নেই?","Tap":"চাপুন","above for exact times wherever you are.":"(উপরে), যেখানেই থাকুন সঠিক সময় পাবেন।","Pick my city":"শহর বেছে নিন","📢 Message everyone":"📢 সবাইকে মেসেজ","Message the whole group 📢":"পুরো গ্রুপকে মেসেজ দাও 📢","Sent to everyone 📢":"সবাইকে পাঠানো হয়েছে 📢",
  "One group message per namaz. Try again at the next waqt 😌":"প্রতি নামাজে একটাই গ্রুপ মেসেজ। পরের ওয়াক্তে আবার পাঠাও 😌","→ 📢 everyone ·":"→ 📢 সবাই ·","Give them a nudge 👉":"একটু খোঁচা দাও 👉","Hype them up ✨":"হাইপ দাও ✨","See their month →":"তার পুরো মাস দেখুন →",
  "💬 Nudges":"💬 খোঁচা","Last 2 days":"গত ২ দিন","Tap a friend's ring above to nudge them or hype them up.":"বন্ধুর রিংয়ে চাপ দিয়ে খোঁচা বা হাইপ দাও।",
  "Already sent one for this namaz 😌":"এই নামাজের জন্য একটা পাঠানো হয়ে গেছে 😌","Couldn't send that. Try again.":"পাঠানো যায়নি। আবার চেষ্টা করুন।","Replied 💬":"উত্তর দেওয়া হয়েছে 💬",
  "Sent ✓":"পাঠানো হয়েছে ✓","One per namaz, so nobody gets spammed. Try again at the next waqt 😌":"প্রতি নামাজে একটাই, যাতে কেউ বিরক্ত না হয়। পরের ওয়াক্তে আবার পাঠাও 😌","Everyone in the group sees each other's 🔥 streak and today's fardh rings.":"গ্রুপের সবাই একে অপরের 🔥 স্ট্রিক আর আজকের ফরজের রিং দেখতে পায়।","🌍 Everyone today":"🌍 আজ সবাই","Looking up the group…":"গ্রুপ খোঁজা হচ্ছে…","No group has that code. Check it with your friend.":"এই কোডে কোনো গ্রুপ নেই। বন্ধুর কাছ থেকে আবার দেখে নিন।",
  "Code":"কোড","👥 You're invited to":"👥 আপনাকে আমন্ত্রণ জানানো হয়েছে","Join the board first, then you'll be asked to join the group.":"আগে বোর্ডে যোগ দিন, তারপর গ্রুপে যোগ দিতে বলা হবে।",
  "No group has that code. Check it and try again.":"এই কোডে কোনো গ্রুপ নেই। দেখে আবার চেষ্টা করুন।","Alerts on your phone follow this too.":"ফোনের অ্যালার্টও এই ভাষায় আসবে।",
  // alerts
  "Namaz alerts":"নামাজের অ্যালার্ট","🔔 Alerts are on for this phone.":"🔔 এই ফোনে অ্যালার্ট চালু আছে।","Send a test":"পরীক্ষা পাঠান","Turn off on this phone":"এই ফোনে বন্ধ করুন",
  "Turn alerts on on this phone. You can do this on each device you use.":"এই ফোনে অ্যালার্ট চালু করুন। প্রতিটি ডিভাইসে আলাদাভাবে চালু করতে হয়।",
  "Turn on alerts 🔔":"অ্যালার্ট চালু করুন 🔔","What to send me":"কী পাঠাবে",
  "When each waqt starts":"প্রতি ওয়াক্ত শুরু হলে","Streak saver":"স্ট্রিক রক্ষা",
  "30 min before a waqt ends, only if you haven't logged its fardh":"ওয়াক্ত শেষ হওয়ার ৩০ মিনিট আগে, শুধু যদি ফরজ লগ না করে থাকেন",
  "Jumu'ah reminder":"জুমার রিমাইন্ডার","On Fridays, 1 hour before Dhuhr, with a nudge to read Surah Al-Kahf":"শুক্রবার যোহরের ১ ঘণ্টা আগে, সূরা কাহফ পড়ার কথা মনে করিয়ে",
  "Alerts use your city and times from Settings. Most phones also show them on a smartwatch.":"অ্যালার্ট আপনার সেটিংসের শহর ও সময় অনুযায়ী আসে। বেশিরভাগ ফোনে স্মার্টওয়াচেও দেখায়।",
  "Quiet hours":"নীরব সময়","No alerts during these hours, for example while you sleep. Alerts for Fajr may be skipped if they fall inside.":"এই সময়ে কোনো অ্যালার্ট আসবে না, যেমন ঘুমের সময়। এর মধ্যে পড়লে ফজরের অ্যালার্টও বাদ যেতে পারে।",
  "Use quiet hours":"নীরব সময় চালু করুন","From":"থেকে","Until":"পর্যন্ত",
  // login & requests
  "Pray together, streak together 🔥":"একসাথে নামাজ, একসাথে স্ট্রিক 🔥",
  "Log your five daily namaz, keep your streak alive, and see how your friends are doing.":"প্রতিদিনের পাঁচ ওয়াক্ত নামাজ লগ করুন, স্ট্রিক ধরে রাখুন, আর বন্ধুরা কেমন করছে দেখুন।",
  "Continue with Google":"Google দিয়ে চালিয়ে যান","Ask to join 🌸":"যোগ দেওয়ার অনুরোধ 🌸","Your name":"আপনার নাম","Message (optional)":"বার্তা (ঐচ্ছিক)","Ask to join":"অনুরোধ পাঠান",
  "Request sent 💌":"অনুরোধ পাঠানো হয়েছে 💌","Cancel request":"অনুরোধ বাতিল","Use another account":"অন্য অ্যাকাউন্ট ব্যবহার করুন",
  // tour buttons
  "Next":"পরবর্তী","Skip":"বাদ দিন","Start":"শুরু করুন","Alhamdulillah ✨":"আলহামদুলিল্লাহ ✨",
  // admin
  "Join requests 💌":"যোগ দেওয়ার অনুরোধ 💌","Share the app link. People sign in with Google and ask to join. You approve them here.":"অ্যাপের লিংক শেয়ার করুন। সবাই Google দিয়ে সাইন ইন করে অনুরোধ পাঠাবে, আপনি এখানে অনুমোদন দেবেন।",
  "Approve":"অনুমোদন","Decline":"বাতিল","No requests right now. When someone signs in and asks to join, they'll appear here and you'll get a notification.":"এখন কোনো অনুরোধ নেই। কেউ অনুরোধ পাঠালে এখানে দেখাবে, আর আপনি নোটিফিকেশন পাবেন।",
  "Or invite directly":"অথবা সরাসরি আমন্ত্রণ","Add a Gmail address and that person can join straight away, without asking.":"একটি Gmail ঠিকানা দিন, সেই ব্যক্তি অনুরোধ ছাড়াই সরাসরি যোগ দিতে পারবে।","No invites yet.":"এখনো কোনো আমন্ত্রণ নেই।",
  "Removing someone deletes their log for good.":"কাউকে বাদ দিলে তার লগ চিরতরে মুছে যায়।","(you)":"(আপনি)",
  "This browser can't receive notifications. On Android use Chrome; on iPhone use Safari and add the app to your home screen.":"এই ব্রাউজারে নোটিফিকেশন আসে না। অ্যান্ড্রয়েডে Chrome ব্যবহার করুন; আইফোনে Safari দিয়ে অ্যাপটি হোম স্ক্রিনে যোগ করুন।",
  "made with":"বানানো","by Shupti":"Shupti-র হাতে",
  // more toasts
  "Alerts off on this phone":"এই ফোনে অ্যালার্ট বন্ধ","Alerts on 🔔 You'll get a notification for each namaz.":"অ্যালার্ট চালু 🔔 প্রতি ওয়াক্তে নোটিফিকেশন পাবেন।",
  "Couldn't save that. Check your connection and try again.":"সেভ হয়নি। ইন্টারনেট দেখে আবার চেষ্টা করুন।","Couldn't save that. Try again.":"সেভ হয়নি। আবার চেষ্টা করুন।","Couldn't save that.":"সেভ হয়নি।","Couldn't save.":"সেভ হয়নি।",
  "Couldn't change that. Try again in a moment.":"বদলানো যায়নি। একটু পরে আবার চেষ্টা করুন।",
  "Group created 🌸 Tap Invite to share it.":"গ্রুপ বানানো হয়েছে 🌸 শেয়ার করতে আমন্ত্রণ চাপুন।","Group deleted":"গ্রুপ মুছে ফেলা হয়েছে",
  "Invite link copied. Paste it to your friends.":"আমন্ত্রণ লিংক কপি হয়েছে। বন্ধুদের পাঠিয়ে দিন।",
  "Notifications are blocked. Allow them in your phone's settings for this app.":"নোটিফিকেশন বন্ধ করা আছে। ফোনের সেটিংসে এই অ্যাপের জন্য চালু করুন।",
  "Removed from the group":"গ্রুপ থেকে বাদ দেওয়া হয়েছে","Request declined":"অনুরোধ বাতিল হয়েছে","You left the group":"আপনি গ্রুপ ছেড়েছেন","You're approved! 🎉":"আপনাকে অনুমোদন দেওয়া হয়েছে! 🎉",
  "You're offline. Will save when you're back.":"আপনি অফলাইনে। ইন্টারনেট ফিরলে সেভ হবে।","Your account and logs were deleted.":"আপনার অ্যাকাউন্ট ও লগ মুছে ফেলা হয়েছে।",
  "The app is still starting. Try again in a moment.":"অ্যাপ চালু হচ্ছে। একটু পরে আবার চেষ্টা করুন।",
  "This browser can't share location. Pick your city from the list instead.":"এই ব্রাউজার লোকেশন দিতে পারে না। তালিকা থেকে শহর বেছে নিন।",
  // toasts
  "Saved":"সেভ হয়েছে","Excuse removed":"ছাড় তুলে নেওয়া হয়েছে","⏸ Day excused. Your streak is paused. Only you can see this.":"⏸ দিনটি ছাড় দেওয়া হলো। স্ট্রিক থেমে আছে। এটা শুধু আপনি দেখতে পান।",
  "All 5 fardh done for the day.":"আজকের পাঁচ ওয়াক্ত ফরজ পড়া হয়েছে।","Made up ✓ MashaAllah":"আদায় হয়েছে ✓ মাশাআল্লাহ","All made up ✨ MashaAllah":"সব আদায় হয়েছে ✨ মাশাআল্লাহ",
  "That namaz's logging window has closed.":"এই নামাজ লগ করার সময় শেষ।","That day is locked now.":"এই দিনটি এখন বন্ধ।",
  "🌍 You're public. You're on the Everyone board.":"🌍 আপনি পাবলিক। আপনি সবার বোর্ডে আছেন।",
  "🔒 You're private. Hidden from the Everyone board; your groups still see you.":"🔒 আপনি প্রাইভেট। সবার বোর্ডে দেখা যাবে না; আপনার গ্রুপ এখনো দেখবে।"
};

const RULES = [
  [/^Signed in as 🔑 no email \(signs in with a code\)$/, () => "সাইন ইন: 🔑 ইমেইল ছাড়া (কোড দিয়ে)"],
  [/^🧭 Your phone is on a different time zone from$/, () => "🧭 আপনার ফোনের টাইম জোন আলাদা:"],
  [/^, so these are$/, () => "। এগুলো"],
  [/^times\. Moved or travelling\?$/, () => "-এর সময়। জায়গা বদলেছেন বা ভ্রমণে আছেন?"],
  [/^Use (.+)$/, (_,c) => `${c} ব্যবহার করুন`],
  [/^Keep (.+)$/, (_,c) => `${c}-ই রাখুন`],
  [/^Now using (.+) times ✓$/, (_,c) => `এখন ${c}-এর সময় দেখানো হচ্ছে ✓`],
  [/^Everyone · (\d+) friends?$/, (_,n) => `সবাই · ${n} জন বন্ধু`],
  [/^→ 📢 everyone · (\d+) (min|h|d) ago$/, (_,n,u) => `→ 📢 সবাই · ${n} ${({min:"মিনিট",h:"ঘণ্টা",d:"দিন"})[u]} আগে`],
  [/^Sent to (.+) 🚀$/, (_,n) => `${n}-কে পাঠানো হয়েছে 🚀`],
  [/^(Fajr|Dhuhr|Asr|Maghrib|Isha): not logged yet$/, (_,n) => `${w(n)}: এখনো লগ করেনি`],
  [/^prayed (Fajr|Dhuhr|Asr|Maghrib|Isha) ✓$/, (_,n) => `${w(n)} পড়েছে ✓`],
  [/^· (\d+) (min|h|d) ago$/, (_,n,u) => `· ${n} ${({min:"মিনিট",h:"ঘণ্টা",d:"দিন"})[u]} আগে`],
  [/^(\d+) members? · 🔥 Streaks & rings$/, (_,n) => `${n} জন সদস্য · 🔥 স্ট্রিক ও রিং`],
  [/^Created by (.+)\. Members see each other's 🔥 streak and today's fardh rings\.$/, (_,n) => `${n} বানিয়েছেন। সদস্যরা একে অপরের 🔥 স্ট্রিক আর আজকের ফরজের রিং দেখে।`],
  [/^Today in (.+)$/, (_,n) => `আজ ${n}-এ`],
  [/^(\d+) public members? · 🔥 Streaks and today's rings$/, (_,n) => `${n} জন পাবলিক সদস্য · 🔥 স্ট্রিক ও আজকের রিং`],
  [/^Join (.+)$/, (_,n) => `${n}-এ যোগ দিন`],
  [/^(\d+) members? · (📖 Full details|🔥 Streaks only)$/, (_,n,m) => `${n} জন সদস্য · ${m.startsWith("📖")?"📖 সম্পূর্ণ বিস্তারিত":"🔥 শুধু স্ট্রিক"}`],
  [/^Every fardh so far ✨ (\d+)%$/, (_,p) => `এ পর্যন্ত সব ফরজ ✨ ${p}%`],
  [/^(\d+)% · (\d+) missed$/, (_,p,n) => `${p}% · ${n}টি বাদ গেছে`],
  [/^💌 ?(\d+) (?:person wants|people want) to join$/, (_,n) => `💌 ${n} জন যোগ দিতে চান`],
  [/^(\d+) (?:person wants|people want) to join$/, (_,n) => `${n} জন যোগ দিতে চান`],
  [/^(.+) · (\d+) (min|h|d) ago$/, (_,e,n,u) => `${e} · ${n} ${({min:"মিনিট",h:"ঘণ্টা",d:"দিন"})[u]} আগে`],
  [/^(.+) · (Hanafi Asr|Standard Asr)$/, (_,c,a) => `${c} · ${a==="Hanafi Asr"?"হানাফি আসর":"সাধারণ আসর"}`],
  [/^Earned by praying all 5 fardh for days in a row\. Your best streak:$/, () => "পরপর অনেক দিন পাঁচ ওয়াক্ত ফরজ পড়ে অর্জন করুন। আপনার সেরা স্ট্রিক:"],
  [/^“🌸 It's (.+) time · ends (.+)”$/, (_,n,t) => `“🌸 ${w(n)}-এর সময় হয়েছে · শেষ ${t}”`],
  [/^Assalamu alaikum, (.+) ✨$/, (_,n) => `আসসালামু আলাইকুম, ${n} ✨`],
  [/^left in this waqt · (.+) at (.+)$/, (_,n,t) => `এই ওয়াক্তের বাকি · ${w(n)} ${t}`],
  [/^No fardh namaz now · until Dhuhr$/, () => "এখন কোনো ফরজ নামাজ নেই · যোহর পর্যন্ত"],
  [/^🌙 Tahajjud's best time starts (.+)$/, (_,t) => `🌙 তাহাজ্জুদের উত্তম সময় শুরু ${t}`],
  [/^🌅 Sunrise (.+) · Ishraq from (.+)$/, (_,a,b) => `🌅 সূর্যোদয় ${a} · ইশরাক ${b} থেকে`],
  [/^☀️ Ishraq and Duha time · Dhuhr at (.+)$/, (_,t) => `☀️ ইশরাক ও দুহার সময় · যোহর ${t}`],
  [/^⛔ Makruh time: don't pray until (.+?), (the sun is rising|the sun is at its highest \(zawal\)|the sun is setting)\.(.*)$/, (_,t,why,ex) =>
    `⛔ মাকরুহ সময়: ${t} পর্যন্ত নামাজ পড়বেন না, ${({"the sun is rising":"সূর্য উঠছে","the sun is at its highest (zawal)":"সূর্য মাথার উপরে (জাওয়াল)","the sun is setting":"সূর্য ডুবছে"})[why]}।${ex ? " ব্যতিক্রম: আজকের আসর না পড়ে থাকলে এখনই পড়ে নিন, তা আদায় হবে।" : ""}`],
  [/^🌸 It's (.+) time!$/, (_,n) => `🌸 ${w(n)}-এর সময় হয়েছে!`],
  [/^🌸 It's (.+) time! Go pray, then tap Fardh\.$/, (_,n) => `🌸 ${w(n)}-এর সময় হয়েছে! নামাজ পড়ে ফরজ চাপুন।`],
  [/^(\d+)-day streak$/, (_,n) => `${n} দিনের স্ট্রিক`],
  [/^🔥 (\d+)-day streak! All 5 fardh done\.$/, (_,n) => `🔥 ${n} দিনের স্ট্রিক! পাঁচ ওয়াক্ত ফরজই পড়া হয়েছে।`],
  [/^Log (.+?) by (.+) to keep it\.$/, (_,n,t) => `স্ট্রিক রাখতে ${t}-এর মধ্যে ${w(n)} লগ করুন।`],
  [/^Log (.+?) by (.+) to stay on track\.$/, (_,n,t) => `${t}-এর মধ্যে ${w(n)} লগ করুন।`],
  [/^(\d+) of 5 fardh today\. Keep going to add day (\d+)\.$/, (_,a,b) => `আজ ৫ ওয়াক্তের ${a} ওয়াক্ত পড়া হয়েছে। চালিয়ে যান, ${b}তম দিন যোগ হবে।`],
  [/^👥 (\d+) groups?$/, (_,n) => `👥 ${n}টি গ্রুপ`],
  [/^Now · (.+) left$/, (_,d) => `এখন · ${dur(d)} বাকি`],
  [/^Log by (.+) or it locks and your streak breaks\.$/, (_,t) => `${t}-এর মধ্যে লগ করুন, নইলে বন্ধ হয়ে স্ট্রিক ভেঙে যাবে।`],
  [/^Best before (.+)\. The last (\d+) minutes before Maghrib are makruh \(the sun is setting\)\.$/, (_,t,m) => `${t}-এর আগে পড়া উত্তম। মাগরিবের আগের শেষ ${m} মিনিট মাকরুহ (সূর্য ডুবছে)।`],
  [/^Haven't prayed Asr yet\? Pray it now, before Maghrib at (.+)\. Delaying.*$/, (_,t) => `আসর এখনো পড়েননি? মাগরিবের (${t}) আগে এখনই পড়ে নিন। এত দেরি করা অপছন্দনীয়, তবে আজকের আসর এখনো আদায় হবে, আর না পড়ার চেয়ে অনেক ভালো।`],
  [/^Last third of the night from (.+)$/, (_,t) => `রাতের শেষ তৃতীয়াংশ ${t} থেকে`],
  [/^(\d+) members? · 📖 Full details$/, (_,n) => `${n} জন সদস্য · 📖 সম্পূর্ণ বিস্তারিত`],
  [/^(\d+) members? · 🔥 Streaks only$/, (_,n) => `${n} জন সদস্য · 🔥 শুধু স্ট্রিক`],
  [/^(\d+) public members? · 🔥 Streaks and grades$/, (_,n) => `${n} জন পাবলিক সদস্য · 🔥 স্ট্রিক ও গ্রেড`],
  [/^Group streak · (\d+) days?$/, (_,n) => `গ্রুপ স্ট্রিক · ${n} দিন`],
  [/^(\d+)\/(\d+) fardh$/, (_,a,b) => `${a}/${b} ফরজ`],
  [/^(\d+) pts$/, (_,n) => `${n} পয়েন্ট`],
  [/^(.+) gradesheet$/, (_,m) => `${m} মাসের গ্রেডশিট`],
  [/^Tahajjud on (\d+) of (\d+) nights this month\.$/, (_,a,b) => `এ মাসে ${b} রাতের মধ্যে ${a} রাত তাহাজ্জুদ।`],
  [/^(\d+) to go$/, (_,n) => `আর ${n} দিন`],
  [/^(\d+) left$/, (_,n) => `${n}টি বাকি`],
  [/^(\d+) of (\d+) made up$/, (_,a,b) => `${b}টির মধ্যে ${a}টি আদায় হয়েছে`],
  [/^Signed in as (.+)$/, (_,e) => `সাইন ইন: ${e}`],
  [/^Using (.+) \(rounded to about 10 km\)\.(?: Tap Save\.)?$/, (_,p) => `${p} ব্যবহার হচ্ছে (প্রায় ১০ কিমি পর্যন্ত গোল করা)।`],
  [/^Created by (.+)\. (.+)$/, (_,n) => `${n} বানিয়েছেন।`]
];

for (const k of Object.keys(DICT)){ const t = k.trim(); if (t !== k){ DICT[t] = DICT[k].trim(); delete DICT[k]; } }
const DAYS = {Mon:"সোম",Tue:"মঙ্গল",Wed:"বুধ",Thu:"বৃহস্পতি",Fri:"শুক্র",Sat:"শনি",Sun:"রবি",Monday:"সোমবার",Tuesday:"মঙ্গলবার",Wednesday:"বুধবার",Thursday:"বৃহস্পতিবার",Friday:"শুক্রবার",Saturday:"শনিবার",Sunday:"রবিবার"};
const MONTHS = ["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"];
const MON_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const dates = s => s
  .replace(/\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\b/g, m => MONTHS[MON_EN.findIndex(x => x.startsWith(m.slice(0,3)))])
  .replace(/\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/g, m => DAYS[m])
  .replace(/(\d)\s?(am|pm)\b/gi, (_, d, x) => d + " " + x.toUpperCase());
const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
// Leave codes like "A1B2C3" alone: only convert digits that aren't stuck to Latin letters.
const toBnDigits = s => s.replace(/(?<![A-Za-z\d])\d+(?![A-Za-z\d])/g, n => n.replace(/\d/g, d => BN_DIGITS[d]));
function tr(text){
  const lead = text.match(/^\s*/)[0], trail = text.match(/\s*$/)[0], core = text.trim();
  if (!core) return text;
  let out = DICT[core];
  if (out == null) for (const [re, fn] of RULES){ const m = core.match(re); if (m){ out = fn(...m); break; } }
  return lead + toBnDigits(dates(out ?? core)) + trail;
}
const SKIP = '[data-notr], .pname, .fn, .av, .gchip:not(.add):not([data-id=all]), .ghead h3, .mrow .n, .reqrow .who b, .reqrow .who p, .pod .nm, script, style, textarea, input, .wm, .row1';
function translateTree(root){
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {acceptNode: n =>
    !n.nodeValue.trim() || n.parentElement?.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT});
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const n of nodes){ const t = tr(n.nodeValue); if (t !== n.nodeValue) n.nodeValue = t; }
  const els = root.querySelectorAll ? [root, ...root.querySelectorAll("[placeholder],[title],[aria-label]")] : [];
  for (const el of els) for (const a of ["placeholder","title","aria-label"]){
    if (!el.hasAttribute?.(a) || el.closest("[data-notr]")) continue;
    const v = el.getAttribute(a), t = tr(v); if (t !== v) el.setAttribute(a, t);
  }
}
window.NB_I18N = {tr, translateTree, toBnDigits};
let lang = "en"; try { lang = localStorage.getItem("nb-lang") === "bn" ? "bn" : "en"; } catch {}
if (lang === "bn"){
  document.documentElement.lang = "bn";
  const start = () => {
    translateTree(document.body);
    let queued = new Set(), timer = 0;
    new MutationObserver(muts => {
      for (const m of muts) queued.add(m.type === "characterData" ? m.target.parentElement : m.target);
      if (!timer) timer = requestAnimationFrame(() => { timer = 0; const q = queued; queued = new Set(); q.forEach(el => el && el.isConnected && translateTree(el)); });
    }).observe(document.body, {childList:true, subtree:true, characterData:true});
  };
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
}
})();
