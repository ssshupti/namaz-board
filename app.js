/* Namaz Board — app logic. Data lives in Supabase; times are computed on the device with adhan. */
(() => {
const CONF = window.NAMAZ_CONFIG || {};
const CITIES = {
  dhaka:{name:"Dhaka",group:"Bangladesh",lat:23.8103,lng:90.4125,tz:"Asia/Dhaka",method:"Karachi"},
  chattogram:{name:"Chattogram",group:"Bangladesh",lat:22.3569,lng:91.7832,tz:"Asia/Dhaka",method:"Karachi"},
  sylhet:{name:"Sylhet",group:"Bangladesh",lat:24.8949,lng:91.8687,tz:"Asia/Dhaka",method:"Karachi"},
  rajshahi:{name:"Rajshahi",group:"Bangladesh",lat:24.3745,lng:88.6042,tz:"Asia/Dhaka",method:"Karachi"},
  khulna:{name:"Khulna",group:"Bangladesh",lat:22.8456,lng:89.5403,tz:"Asia/Dhaka",method:"Karachi"},
  barishal:{name:"Barishal",group:"Bangladesh",lat:22.701,lng:90.3535,tz:"Asia/Dhaka",method:"Karachi"},
  rangpur:{name:"Rangpur",group:"Bangladesh",lat:25.7439,lng:89.2752,tz:"Asia/Dhaka",method:"Karachi"},
  mymensingh:{name:"Mymensingh",group:"Bangladesh",lat:24.7471,lng:90.4203,tz:"Asia/Dhaka",method:"Karachi"},
  cumilla:{name:"Cumilla",group:"Bangladesh",lat:23.4607,lng:91.1809,tz:"Asia/Dhaka",method:"Karachi"},
  gazipur:{name:"Gazipur",group:"Bangladesh",lat:23.9999,lng:90.4203,tz:"Asia/Dhaka",method:"Karachi"},
  narayanganj:{name:"Narayanganj",group:"Bangladesh",lat:23.6238,lng:90.5,tz:"Asia/Dhaka",method:"Karachi"},
  coxsbazar:{name:"Cox's Bazar",group:"Bangladesh",lat:21.4272,lng:92.0058,tz:"Asia/Dhaka",method:"Karachi"},
  bogura:{name:"Bogura",group:"Bangladesh",lat:24.8466,lng:89.3773,tz:"Asia/Dhaka",method:"Karachi"},
  jashore:{name:"Jashore",group:"Bangladesh",lat:23.1664,lng:89.2081,tz:"Asia/Dhaka",method:"Karachi"},
  noakhali:{name:"Noakhali",group:"Bangladesh",lat:22.8696,lng:91.0995,tz:"Asia/Dhaka",method:"Karachi"},
  feni:{name:"Feni",group:"Bangladesh",lat:23.0159,lng:91.3976,tz:"Asia/Dhaka",method:"Karachi"},
  brahmanbaria:{name:"Brahmanbaria",group:"Bangladesh",lat:23.9571,lng:91.1119,tz:"Asia/Dhaka",method:"Karachi"},
  tangail:{name:"Tangail",group:"Bangladesh",lat:24.2513,lng:89.9167,tz:"Asia/Dhaka",method:"Karachi"},
  dinajpur:{name:"Dinajpur",group:"Bangladesh",lat:25.6217,lng:88.6354,tz:"Asia/Dhaka",method:"Karachi"},
  kushtia:{name:"Kushtia",group:"Bangladesh",lat:23.9013,lng:89.1203,tz:"Asia/Dhaka",method:"Karachi"},
  pabna:{name:"Pabna",group:"Bangladesh",lat:24.0064,lng:89.2372,tz:"Asia/Dhaka",method:"Karachi"},
  moulvibazar:{name:"Moulvibazar",group:"Bangladesh",lat:24.4829,lng:91.7774,tz:"Asia/Dhaka",method:"Karachi"},
  habiganj:{name:"Habiganj",group:"Bangladesh",lat:24.3745,lng:91.4155,tz:"Asia/Dhaka",method:"Karachi"},
  sunamganj:{name:"Sunamganj",group:"Bangladesh",lat:25.0658,lng:91.395,tz:"Asia/Dhaka",method:"Karachi"},
  london:{name:"London",group:"United Kingdom",lat:51.5074,lng:-0.1278,tz:"Europe/London",method:"MoonsightingCommittee"},
  birmingham:{name:"Birmingham",group:"United Kingdom",lat:52.4862,lng:-1.8904,tz:"Europe/London",method:"MoonsightingCommittee"},
  manchester:{name:"Manchester",group:"United Kingdom",lat:53.4808,lng:-2.2426,tz:"Europe/London",method:"MoonsightingCommittee"},
  leeds:{name:"Leeds",group:"United Kingdom",lat:53.8008,lng:-1.5491,tz:"Europe/London",method:"MoonsightingCommittee"},
  bradford:{name:"Bradford",group:"United Kingdom",lat:53.796,lng:-1.7594,tz:"Europe/London",method:"MoonsightingCommittee"},
  leicester:{name:"Leicester",group:"United Kingdom",lat:52.6369,lng:-1.1398,tz:"Europe/London",method:"MoonsightingCommittee"},
  sheffield:{name:"Sheffield",group:"United Kingdom",lat:53.3811,lng:-1.4701,tz:"Europe/London",method:"MoonsightingCommittee"},
  liverpool:{name:"Liverpool",group:"United Kingdom",lat:53.4084,lng:-2.9916,tz:"Europe/London",method:"MoonsightingCommittee"},
  bristol:{name:"Bristol",group:"United Kingdom",lat:51.4545,lng:-2.5879,tz:"Europe/London",method:"MoonsightingCommittee"},
  nottingham:{name:"Nottingham",group:"United Kingdom",lat:52.9548,lng:-1.1581,tz:"Europe/London",method:"MoonsightingCommittee"},
  coventry:{name:"Coventry",group:"United Kingdom",lat:52.4068,lng:-1.5197,tz:"Europe/London",method:"MoonsightingCommittee"},
  luton:{name:"Luton",group:"United Kingdom",lat:51.8787,lng:-0.42,tz:"Europe/London",method:"MoonsightingCommittee"},
  oldham:{name:"Oldham",group:"United Kingdom",lat:53.5409,lng:-2.1114,tz:"Europe/London",method:"MoonsightingCommittee"},
  newcastle:{name:"Newcastle",group:"United Kingdom",lat:54.9783,lng:-1.6178,tz:"Europe/London",method:"MoonsightingCommittee"},
  cardiff:{name:"Cardiff",group:"United Kingdom",lat:51.4816,lng:-3.1791,tz:"Europe/London",method:"MoonsightingCommittee"},
  glasgow:{name:"Glasgow",group:"United Kingdom",lat:55.8642,lng:-4.2518,tz:"Europe/London",method:"MoonsightingCommittee"},
  edinburgh:{name:"Edinburgh",group:"United Kingdom",lat:55.9533,lng:-3.1883,tz:"Europe/London",method:"MoonsightingCommittee"},
  dublin:{name:"Dublin",group:"Ireland",lat:53.3498,lng:-6.2603,tz:"Europe/Dublin",method:"MoonsightingCommittee"},
  kolkata:{name:"Kolkata",group:"India",lat:22.5726,lng:88.3639,tz:"Asia/Kolkata",method:"Karachi"},
  delhi:{name:"Delhi",group:"India",lat:28.6139,lng:77.209,tz:"Asia/Kolkata",method:"Karachi"},
  mumbai:{name:"Mumbai",group:"India",lat:19.076,lng:72.8777,tz:"Asia/Kolkata",method:"Karachi"},
  karachi:{name:"Karachi",group:"Pakistan",lat:24.8607,lng:67.0011,tz:"Asia/Karachi",method:"Karachi"},
  lahore:{name:"Lahore",group:"Pakistan",lat:31.5204,lng:74.3587,tz:"Asia/Karachi",method:"Karachi"},
  islamabad:{name:"Islamabad",group:"Pakistan",lat:33.6844,lng:73.0479,tz:"Asia/Karachi",method:"Karachi"},
  kathmandu:{name:"Kathmandu",group:"Nepal",lat:27.7172,lng:85.324,tz:"Asia/Kathmandu",method:"Karachi"},
  makkah:{name:"Makkah",group:"Saudi Arabia",lat:21.3891,lng:39.8579,tz:"Asia/Riyadh",method:"UmmAlQura"},
  madinah:{name:"Madinah",group:"Saudi Arabia",lat:24.5247,lng:39.5692,tz:"Asia/Riyadh",method:"UmmAlQura"},
  riyadh:{name:"Riyadh",group:"Saudi Arabia",lat:24.7136,lng:46.6753,tz:"Asia/Riyadh",method:"UmmAlQura"},
  jeddah:{name:"Jeddah",group:"Saudi Arabia",lat:21.4858,lng:39.1925,tz:"Asia/Riyadh",method:"UmmAlQura"},
  dubai:{name:"Dubai",group:"UAE",lat:25.2048,lng:55.2708,tz:"Asia/Dubai",method:"Dubai"},
  abudhabi:{name:"Abu Dhabi",group:"UAE",lat:24.4539,lng:54.3773,tz:"Asia/Dubai",method:"Dubai"},
  sharjah:{name:"Sharjah",group:"UAE",lat:25.3463,lng:55.4209,tz:"Asia/Dubai",method:"Dubai"},
  doha:{name:"Doha",group:"Qatar",lat:25.2854,lng:51.531,tz:"Asia/Qatar",method:"Qatar"},
  kuwait:{name:"Kuwait City",group:"Kuwait",lat:29.3759,lng:47.9774,tz:"Asia/Kuwait",method:"Kuwait"},
  manama:{name:"Manama",group:"Bahrain",lat:26.2285,lng:50.586,tz:"Asia/Bahrain",method:"UmmAlQura"},
  muscat:{name:"Muscat",group:"Oman",lat:23.588,lng:58.3829,tz:"Asia/Muscat",method:"UmmAlQura"},
  istanbul:{name:"Istanbul",group:"Turkey",lat:41.0082,lng:28.9784,tz:"Europe/Istanbul",method:"Turkey"},
  ankara:{name:"Ankara",group:"Turkey",lat:39.9334,lng:32.8597,tz:"Europe/Istanbul",method:"Turkey"},
  cairo:{name:"Cairo",group:"Egypt",lat:30.0444,lng:31.2357,tz:"Africa/Cairo",method:"Egyptian"},
  kualalumpur:{name:"Kuala Lumpur",group:"Malaysia",lat:3.139,lng:101.6869,tz:"Asia/Kuala_Lumpur",method:"Singapore"},
  singapore:{name:"Singapore",group:"Singapore",lat:1.3521,lng:103.8198,tz:"Asia/Singapore",method:"Singapore"},
  jakarta:{name:"Jakarta",group:"Indonesia",lat:-6.2088,lng:106.8456,tz:"Asia/Jakarta",method:"Singapore"},
  paris:{name:"Paris",group:"France",lat:48.8566,lng:2.3522,tz:"Europe/Paris",method:"MuslimWorldLeague"},
  berlin:{name:"Berlin",group:"Germany",lat:52.52,lng:13.405,tz:"Europe/Berlin",method:"MuslimWorldLeague"},
  rome:{name:"Rome",group:"Italy",lat:41.9028,lng:12.4964,tz:"Europe/Rome",method:"MuslimWorldLeague"},
  madrid:{name:"Madrid",group:"Spain",lat:40.4168,lng:-3.7038,tz:"Europe/Madrid",method:"MuslimWorldLeague"},
  lisbon:{name:"Lisbon",group:"Portugal",lat:38.7223,lng:-9.1393,tz:"Europe/Lisbon",method:"MuslimWorldLeague"},
  amsterdam:{name:"Amsterdam",group:"Netherlands",lat:52.3676,lng:4.9041,tz:"Europe/Amsterdam",method:"MuslimWorldLeague"},
  almere:{name:"Almere",group:"Netherlands",lat:52.3508,lng:5.2647,tz:"Europe/Amsterdam",method:"MuslimWorldLeague"},
  stockholm:{name:"Stockholm",group:"Sweden",lat:59.3293,lng:18.0686,tz:"Europe/Stockholm",method:"MuslimWorldLeague"},
  newyork:{name:"New York",group:"USA",lat:40.7128,lng:-74.006,tz:"America/New_York",method:"NorthAmerica"},
  chicago:{name:"Chicago",group:"USA",lat:41.8781,lng:-87.6298,tz:"America/Chicago",method:"NorthAmerica"},
  houston:{name:"Houston",group:"USA",lat:29.7604,lng:-95.3698,tz:"America/Chicago",method:"NorthAmerica"},
  losangeles:{name:"Los Angeles",group:"USA",lat:34.0522,lng:-118.2437,tz:"America/Los_Angeles",method:"NorthAmerica"},
  toronto:{name:"Toronto",group:"Canada",lat:43.6532,lng:-79.3832,tz:"America/Toronto",method:"NorthAmerica"},
  regina:{name:"Regina",group:"Canada",lat:50.4452,lng:-104.6189,tz:"America/Regina",method:"NorthAmerica"},
  saskatoon:{name:"Saskatoon",group:"Canada",lat:52.1332,lng:-106.67,tz:"America/Regina",method:"NorthAmerica"},
  sydney:{name:"Sydney",group:"Australia",lat:-33.8688,lng:151.2093,tz:"Australia/Sydney",method:"MuslimWorldLeague"},
  melbourne:{name:"Melbourne",group:"Australia",lat:-37.8136,lng:144.9631,tz:"Australia/Melbourne",method:"MuslimWorldLeague"},
  brisbane:{name:"Brisbane",group:"Australia",lat:-27.4698,lng:153.0251,tz:"Australia/Brisbane",method:"MuslimWorldLeague"},
  goldcoast:{name:"Gold Coast",group:"Australia",lat:-28.0167,lng:153.4,tz:"Australia/Brisbane",method:"MuslimWorldLeague"},
  tokyo:{name:"Tokyo",group:"Japan",lat:35.6762,lng:139.6503,tz:"Asia/Tokyo",method:"MuslimWorldLeague"},
  faridpur:{name:"Faridpur",group:"Bangladesh",lat:23.607,lng:89.8429,tz:"Asia/Dhaka",method:"Karachi"},
  jamalpur:{name:"Jamalpur",group:"Bangladesh",lat:24.9375,lng:89.9372,tz:"Asia/Dhaka",method:"Karachi"},
  kishoreganj:{name:"Kishoreganj",group:"Bangladesh",lat:24.4449,lng:90.7766,tz:"Asia/Dhaka",method:"Karachi"},
  narsingdi:{name:"Narsingdi",group:"Bangladesh",lat:23.9229,lng:90.7177,tz:"Asia/Dhaka",method:"Karachi"},
  savar:{name:"Savar",group:"Bangladesh",lat:23.8583,lng:90.2667,tz:"Asia/Dhaka",method:"Karachi"},
  chandpur:{name:"Chandpur",group:"Bangladesh",lat:23.2333,lng:90.6713,tz:"Asia/Dhaka",method:"Karachi"},
  lakshmipur:{name:"Lakshmipur",group:"Bangladesh",lat:22.9447,lng:90.8282,tz:"Asia/Dhaka",method:"Karachi"},
  bhola:{name:"Bhola",group:"Bangladesh",lat:22.6859,lng:90.6482,tz:"Asia/Dhaka",method:"Karachi"},
  patuakhali:{name:"Patuakhali",group:"Bangladesh",lat:22.3596,lng:90.3299,tz:"Asia/Dhaka",method:"Karachi"},
  satkhira:{name:"Satkhira",group:"Bangladesh",lat:22.7185,lng:89.0705,tz:"Asia/Dhaka",method:"Karachi"},
  bagerhat:{name:"Bagerhat",group:"Bangladesh",lat:22.6602,lng:89.7895,tz:"Asia/Dhaka",method:"Karachi"},
  rangamati:{name:"Rangamati",group:"Bangladesh",lat:22.6574,lng:92.1733,tz:"Asia/Dhaka",method:"Karachi"},
  chapainawabganj:{name:"Chapainawabganj",group:"Bangladesh",lat:24.5965,lng:88.2776,tz:"Asia/Dhaka",method:"Karachi"},
  naogaon:{name:"Naogaon",group:"Bangladesh",lat:24.8136,lng:88.9334,tz:"Asia/Dhaka",method:"Karachi"},
  sirajganj:{name:"Sirajganj",group:"Bangladesh",lat:24.4534,lng:89.7007,tz:"Asia/Dhaka",method:"Karachi"},
  thakurgaon:{name:"Thakurgaon",group:"Bangladesh",lat:26.0336,lng:88.4616,tz:"Asia/Dhaka",method:"Karachi"},
  kurigram:{name:"Kurigram",group:"Bangladesh",lat:25.8054,lng:89.6362,tz:"Asia/Dhaka",method:"Karachi"},
  netrokona:{name:"Netrokona",group:"Bangladesh",lat:24.8836,lng:90.728,tz:"Asia/Dhaka",method:"Karachi"},
  munshiganj:{name:"Munshiganj",group:"Bangladesh",lat:23.5422,lng:90.5305,tz:"Asia/Dhaka",method:"Karachi"},
  bolton:{name:"Bolton",group:"United Kingdom",lat:53.5769,lng:-2.4282,tz:"Europe/London",method:"MoonsightingCommittee"},
  blackburn:{name:"Blackburn",group:"United Kingdom",lat:53.7486,lng:-2.4875,tz:"Europe/London",method:"MoonsightingCommittee"},
  rochdale:{name:"Rochdale",group:"United Kingdom",lat:53.6097,lng:-2.1561,tz:"Europe/London",method:"MoonsightingCommittee"},
  stoke:{name:"Stoke-on-Trent",group:"United Kingdom",lat:53.0027,lng:-2.1794,tz:"Europe/London",method:"MoonsightingCommittee"},
  peterborough:{name:"Peterborough",group:"United Kingdom",lat:52.5695,lng:-0.2405,tz:"Europe/London",method:"MoonsightingCommittee"},
  slough:{name:"Slough",group:"United Kingdom",lat:51.5105,lng:-0.595,tz:"Europe/London",method:"MoonsightingCommittee"},
  reading:{name:"Reading",group:"United Kingdom",lat:51.4543,lng:-0.9781,tz:"Europe/London",method:"MoonsightingCommittee"},
  oxford:{name:"Oxford",group:"United Kingdom",lat:51.752,lng:-1.2577,tz:"Europe/London",method:"MoonsightingCommittee"},
  cambridge:{name:"Cambridge",group:"United Kingdom",lat:52.2053,lng:0.1218,tz:"Europe/London",method:"MoonsightingCommittee"},
  southampton:{name:"Southampton",group:"United Kingdom",lat:50.9097,lng:-1.4044,tz:"Europe/London",method:"MoonsightingCommittee"},
  portsmouth:{name:"Portsmouth",group:"United Kingdom",lat:50.8198,lng:-1.088,tz:"Europe/London",method:"MoonsightingCommittee"},
  brighton:{name:"Brighton",group:"United Kingdom",lat:50.8225,lng:-0.1372,tz:"Europe/London",method:"MoonsightingCommittee"},
  norwich:{name:"Norwich",group:"United Kingdom",lat:52.6309,lng:1.2974,tz:"Europe/London",method:"MoonsightingCommittee"},
  derby:{name:"Derby",group:"United Kingdom",lat:52.9225,lng:-1.4746,tz:"Europe/London",method:"MoonsightingCommittee"},
  swansea:{name:"Swansea",group:"United Kingdom",lat:51.6214,lng:-3.9436,tz:"Europe/London",method:"MoonsightingCommittee"},
  aberdeen:{name:"Aberdeen",group:"United Kingdom",lat:57.1497,lng:-2.0943,tz:"Europe/London",method:"MoonsightingCommittee"},
  dundee:{name:"Dundee",group:"United Kingdom",lat:56.462,lng:-2.9707,tz:"Europe/London",method:"MoonsightingCommittee"},
  belfast:{name:"Belfast",group:"United Kingdom",lat:54.5973,lng:-5.9301,tz:"Europe/London",method:"MoonsightingCommittee"},
  milton_keynes:{name:"Milton Keynes",group:"United Kingdom",lat:52.0406,lng:-0.7594,tz:"Europe/London",method:"MoonsightingCommittee"},
  cork:{name:"Cork",group:"Ireland",lat:51.8985,lng:-8.4756,tz:"Europe/Dublin",method:"MoonsightingCommittee"},
  hamtramck:{name:"Hamtramck / Detroit",group:"USA",lat:42.3928,lng:-83.0496,tz:"America/Detroit",method:"NorthAmerica"},
  paterson:{name:"Paterson",group:"USA",lat:40.9168,lng:-74.1718,tz:"America/New_York",method:"NorthAmerica"},
  philadelphia:{name:"Philadelphia",group:"USA",lat:39.9526,lng:-75.1652,tz:"America/New_York",method:"NorthAmerica"},
  boston:{name:"Boston",group:"USA",lat:42.3601,lng:-71.0589,tz:"America/New_York",method:"NorthAmerica"},
  washington:{name:"Washington DC",group:"USA",lat:38.9072,lng:-77.0369,tz:"America/New_York",method:"NorthAmerica"},
  atlanta:{name:"Atlanta",group:"USA",lat:33.749,lng:-84.388,tz:"America/New_York",method:"NorthAmerica"},
  miami:{name:"Miami",group:"USA",lat:25.7617,lng:-80.1918,tz:"America/New_York",method:"NorthAmerica"},
  buffalo:{name:"Buffalo",group:"USA",lat:42.8864,lng:-78.8784,tz:"America/New_York",method:"NorthAmerica"},
  dallas:{name:"Dallas",group:"USA",lat:32.7767,lng:-96.797,tz:"America/Chicago",method:"NorthAmerica"},
  minneapolis:{name:"Minneapolis",group:"USA",lat:44.9778,lng:-93.265,tz:"America/Chicago",method:"NorthAmerica"},
  denver:{name:"Denver",group:"USA",lat:39.7392,lng:-104.9903,tz:"America/Denver",method:"NorthAmerica"},
  phoenix:{name:"Phoenix",group:"USA",lat:33.4484,lng:-112.074,tz:"America/Phoenix",method:"NorthAmerica"},
  sanfrancisco:{name:"San Francisco",group:"USA",lat:37.7749,lng:-122.4194,tz:"America/Los_Angeles",method:"NorthAmerica"},
  seattle:{name:"Seattle",group:"USA",lat:47.6062,lng:-122.3321,tz:"America/Los_Angeles",method:"NorthAmerica"},
  anchorage:{name:"Anchorage",group:"USA",lat:61.2181,lng:-149.9003,tz:"America/Anchorage",method:"NorthAmerica"},
  honolulu:{name:"Honolulu",group:"USA",lat:21.3099,lng:-157.8581,tz:"Pacific/Honolulu",method:"NorthAmerica"},
  mississauga:{name:"Mississauga",group:"Canada",lat:43.589,lng:-79.6441,tz:"America/Toronto",method:"NorthAmerica"},
  ottawa:{name:"Ottawa",group:"Canada",lat:45.4215,lng:-75.6972,tz:"America/Toronto",method:"NorthAmerica"},
  montreal:{name:"Montreal",group:"Canada",lat:45.5017,lng:-73.5673,tz:"America/Toronto",method:"NorthAmerica"},
  halifax:{name:"Halifax",group:"Canada",lat:44.6488,lng:-63.5752,tz:"America/Halifax",method:"NorthAmerica"},
  stjohns:{name:"St. John's",group:"Canada",lat:47.5615,lng:-52.7126,tz:"America/St_Johns",method:"NorthAmerica"},
  winnipeg:{name:"Winnipeg",group:"Canada",lat:49.8951,lng:-97.1384,tz:"America/Winnipeg",method:"NorthAmerica"},
  calgary:{name:"Calgary",group:"Canada",lat:51.0447,lng:-114.0719,tz:"America/Edmonton",method:"NorthAmerica"},
  edmonton:{name:"Edmonton",group:"Canada",lat:53.5461,lng:-113.4938,tz:"America/Edmonton",method:"NorthAmerica"},
  vancouver:{name:"Vancouver",group:"Canada",lat:49.2827,lng:-123.1207,tz:"America/Vancouver",method:"NorthAmerica"},
  perth:{name:"Perth",group:"Australia",lat:-31.9505,lng:115.8605,tz:"Australia/Perth",method:"MuslimWorldLeague"},
  adelaide:{name:"Adelaide",group:"Australia",lat:-34.9285,lng:138.6007,tz:"Australia/Adelaide",method:"MuslimWorldLeague"},
  canberra:{name:"Canberra",group:"Australia",lat:-35.2809,lng:149.13,tz:"Australia/Sydney",method:"MuslimWorldLeague"},
  darwin:{name:"Darwin",group:"Australia",lat:-12.4634,lng:130.8456,tz:"Australia/Darwin",method:"MuslimWorldLeague"},
  hobart:{name:"Hobart",group:"Australia",lat:-42.8821,lng:147.3272,tz:"Australia/Hobart",method:"MuslimWorldLeague"},
  auckland:{name:"Auckland",group:"New Zealand",lat:-36.8485,lng:174.7633,tz:"Pacific/Auckland",method:"MuslimWorldLeague"},
  wellington:{name:"Wellington",group:"New Zealand",lat:-41.2865,lng:174.7762,tz:"Pacific/Auckland",method:"MuslimWorldLeague"},
  hamburg:{name:"Hamburg",group:"Germany",lat:53.5511,lng:9.9937,tz:"Europe/Berlin",method:"MuslimWorldLeague"},
  frankfurt:{name:"Frankfurt",group:"Germany",lat:50.1109,lng:8.6821,tz:"Europe/Berlin",method:"MuslimWorldLeague"},
  munich:{name:"Munich",group:"Germany",lat:48.1351,lng:11.582,tz:"Europe/Berlin",method:"MuslimWorldLeague"},
  brussels:{name:"Brussels",group:"Belgium",lat:50.8503,lng:4.3517,tz:"Europe/Brussels",method:"MuslimWorldLeague"},
  rotterdam:{name:"Rotterdam",group:"Netherlands",lat:51.9244,lng:4.4777,tz:"Europe/Amsterdam",method:"MuslimWorldLeague"},
  thehague:{name:"The Hague",group:"Netherlands",lat:52.0705,lng:4.3007,tz:"Europe/Amsterdam",method:"MuslimWorldLeague"},
  lyon:{name:"Lyon",group:"France",lat:45.764,lng:4.8357,tz:"Europe/Paris",method:"MuslimWorldLeague"},
  marseille:{name:"Marseille",group:"France",lat:43.2965,lng:5.3698,tz:"Europe/Paris",method:"MuslimWorldLeague"},
  milan:{name:"Milan",group:"Italy",lat:45.4642,lng:9.19,tz:"Europe/Rome",method:"MuslimWorldLeague"},
  barcelona:{name:"Barcelona",group:"Spain",lat:41.3874,lng:2.1686,tz:"Europe/Madrid",method:"MuslimWorldLeague"},
  zurich:{name:"Zurich",group:"Switzerland",lat:47.3769,lng:8.5417,tz:"Europe/Zurich",method:"MuslimWorldLeague"},
  vienna:{name:"Vienna",group:"Austria",lat:48.2082,lng:16.3738,tz:"Europe/Vienna",method:"MuslimWorldLeague"},
  copenhagen:{name:"Copenhagen",group:"Denmark",lat:55.6761,lng:12.5683,tz:"Europe/Copenhagen",method:"MuslimWorldLeague"},
  oslo:{name:"Oslo",group:"Norway",lat:59.9139,lng:10.7522,tz:"Europe/Oslo",method:"MuslimWorldLeague"},
  helsinki:{name:"Helsinki",group:"Finland",lat:60.1699,lng:24.9384,tz:"Europe/Helsinki",method:"MuslimWorldLeague"},
  warsaw:{name:"Warsaw",group:"Poland",lat:52.2297,lng:21.0122,tz:"Europe/Warsaw",method:"MuslimWorldLeague"},
  athens:{name:"Athens",group:"Greece",lat:37.9838,lng:23.7275,tz:"Europe/Athens",method:"MuslimWorldLeague"},
  sarajevo:{name:"Sarajevo",group:"Bosnia & Herzegovina",lat:43.8563,lng:18.4131,tz:"Europe/Sarajevo",method:"Turkey"},
  moscow:{name:"Moscow",group:"Russia",lat:55.7558,lng:37.6173,tz:"Europe/Moscow",method:"MuslimWorldLeague"},
  dammam:{name:"Dammam",group:"Saudi Arabia",lat:26.4207,lng:50.0888,tz:"Asia/Riyadh",method:"UmmAlQura"},
  amman:{name:"Amman",group:"Jordan",lat:31.9454,lng:35.9284,tz:"Asia/Amman",method:"MuslimWorldLeague"},
  jerusalem:{name:"Jerusalem",group:"Palestine",lat:31.7683,lng:35.2137,tz:"Asia/Jerusalem",method:"MuslimWorldLeague"},
  beirut:{name:"Beirut",group:"Lebanon",lat:33.8938,lng:35.5018,tz:"Asia/Beirut",method:"MuslimWorldLeague"},
  baghdad:{name:"Baghdad",group:"Iraq",lat:33.3152,lng:44.3661,tz:"Asia/Baghdad",method:"MuslimWorldLeague"},
  tehran:{name:"Tehran",group:"Iran",lat:35.6892,lng:51.389,tz:"Asia/Tehran",method:"MuslimWorldLeague"},
  izmir:{name:"Izmir",group:"Turkey",lat:38.4237,lng:27.1428,tz:"Europe/Istanbul",method:"Turkey"},
  alexandria:{name:"Alexandria",group:"Egypt",lat:31.2001,lng:29.9187,tz:"Africa/Cairo",method:"Egyptian"},
  casablanca:{name:"Casablanca",group:"Morocco",lat:33.5731,lng:-7.5898,tz:"Africa/Casablanca",method:"MuslimWorldLeague"},
  tunis:{name:"Tunis",group:"Tunisia",lat:36.8065,lng:10.1815,tz:"Africa/Tunis",method:"MuslimWorldLeague"},
  algiers:{name:"Algiers",group:"Algeria",lat:36.7538,lng:3.0588,tz:"Africa/Algiers",method:"MuslimWorldLeague"},
  lagos:{name:"Lagos",group:"Nigeria",lat:6.5244,lng:3.3792,tz:"Africa/Lagos",method:"MuslimWorldLeague"},
  kano:{name:"Kano",group:"Nigeria",lat:12.0022,lng:8.592,tz:"Africa/Lagos",method:"MuslimWorldLeague"},
  nairobi:{name:"Nairobi",group:"Kenya",lat:-1.2921,lng:36.8219,tz:"Africa/Nairobi",method:"MuslimWorldLeague"},
  mogadishu:{name:"Mogadishu",group:"Somalia",lat:2.0469,lng:45.3182,tz:"Africa/Mogadishu",method:"MuslimWorldLeague"},
  addisababa:{name:"Addis Ababa",group:"Ethiopia",lat:8.9806,lng:38.7578,tz:"Africa/Addis_Ababa",method:"MuslimWorldLeague"},
  johannesburg:{name:"Johannesburg",group:"South Africa",lat:-26.2041,lng:28.0473,tz:"Africa/Johannesburg",method:"MuslimWorldLeague"},
  capetown:{name:"Cape Town",group:"South Africa",lat:-33.9249,lng:18.4241,tz:"Africa/Johannesburg",method:"MuslimWorldLeague"},
  dakar:{name:"Dakar",group:"Senegal",lat:14.7167,lng:-17.4677,tz:"Africa/Dakar",method:"MuslimWorldLeague"},
  chennai:{name:"Chennai",group:"India",lat:13.0827,lng:80.2707,tz:"Asia/Kolkata",method:"Karachi"},
  bengaluru:{name:"Bengaluru",group:"India",lat:12.9716,lng:77.5946,tz:"Asia/Kolkata",method:"Karachi"},
  hyderabad:{name:"Hyderabad",group:"India",lat:17.385,lng:78.4867,tz:"Asia/Kolkata",method:"Karachi"},
  guwahati:{name:"Guwahati",group:"India",lat:26.1445,lng:91.7362,tz:"Asia/Kolkata",method:"Karachi"},
  srinagar:{name:"Srinagar",group:"India",lat:34.0837,lng:74.7973,tz:"Asia/Kolkata",method:"Karachi"},
  peshawar:{name:"Peshawar",group:"Pakistan",lat:34.0151,lng:71.5249,tz:"Asia/Karachi",method:"Karachi"},
  kabul:{name:"Kabul",group:"Afghanistan",lat:34.5553,lng:69.2075,tz:"Asia/Kabul",method:"Karachi"},
  colombo:{name:"Colombo",group:"Sri Lanka",lat:6.9271,lng:79.8612,tz:"Asia/Colombo",method:"Karachi"},
  male:{name:"Malé",group:"Maldives",lat:4.1755,lng:73.5093,tz:"Indian/Maldives",method:"Karachi"},
  tashkent:{name:"Tashkent",group:"Uzbekistan",lat:41.2995,lng:69.2401,tz:"Asia/Tashkent",method:"MuslimWorldLeague"},
  almaty:{name:"Almaty",group:"Kazakhstan",lat:43.222,lng:76.8512,tz:"Asia/Almaty",method:"MuslimWorldLeague"},
  baku:{name:"Baku",group:"Azerbaijan",lat:40.4093,lng:49.8671,tz:"Asia/Baku",method:"MuslimWorldLeague"},
  penang:{name:"Penang",group:"Malaysia",lat:5.4141,lng:100.3288,tz:"Asia/Kuala_Lumpur",method:"Singapore"},
  johorbahru:{name:"Johor Bahru",group:"Malaysia",lat:1.4927,lng:103.7414,tz:"Asia/Kuala_Lumpur",method:"Singapore"},
  surabaya:{name:"Surabaya",group:"Indonesia",lat:-7.2575,lng:112.7521,tz:"Asia/Jakarta",method:"Singapore"},
  makassar:{name:"Makassar",group:"Indonesia",lat:-5.1477,lng:119.4327,tz:"Asia/Makassar",method:"Singapore"},
  brunei:{name:"Bandar Seri Begawan",group:"Brunei",lat:4.9031,lng:114.9398,tz:"Asia/Brunei",method:"Singapore"},
  bangkok:{name:"Bangkok",group:"Thailand",lat:13.7563,lng:100.5018,tz:"Asia/Bangkok",method:"MuslimWorldLeague"},
  manila:{name:"Manila",group:"Philippines",lat:14.5995,lng:120.9842,tz:"Asia/Manila",method:"MuslimWorldLeague"},
  hongkong:{name:"Hong Kong",group:"Hong Kong",lat:22.3193,lng:114.1694,tz:"Asia/Hong_Kong",method:"MuslimWorldLeague"},
  seoul:{name:"Seoul",group:"South Korea",lat:37.5665,lng:126.978,tz:"Asia/Seoul",method:"MuslimWorldLeague"},
  osaka:{name:"Osaka",group:"Japan",lat:34.6937,lng:135.5023,tz:"Asia/Tokyo",method:"MuslimWorldLeague"},
  beijing:{name:"Beijing",group:"China",lat:39.9042,lng:116.4074,tz:"Asia/Shanghai",method:"MuslimWorldLeague"},
  guangzhou:{name:"Guangzhou",group:"China",lat:23.1291,lng:113.2644,tz:"Asia/Shanghai",method:"MuslimWorldLeague"},
  yangon:{name:"Yangon",group:"Myanmar",lat:16.8409,lng:96.1735,tz:"Asia/Yangon",method:"Karachi"},
  mexicocity:{name:"Mexico City",group:"Mexico",lat:19.4326,lng:-99.1332,tz:"America/Mexico_City",method:"NorthAmerica"},
  saopaulo:{name:"São Paulo",group:"Brazil",lat:-23.5505,lng:-46.6333,tz:"America/Sao_Paulo",method:"MuslimWorldLeague"},
  buenosaires:{name:"Buenos Aires",group:"Argentina",lat:-34.6037,lng:-58.3816,tz:"America/Argentina/Buenos_Aires",method:"MuslimWorldLeague"},
  portofspain:{name:"Port of Spain",group:"Trinidad & Tobago",lat:10.6549,lng:-61.5019,tz:"America/Port_of_Spain",method:"NorthAmerica"},
  georgetown:{name:"Georgetown",group:"Guyana",lat:6.8013,lng:-58.1551,tz:"America/Guyana",method:"NorthAmerica"},
  fiji:{name:"Suva",group:"Fiji",lat:-18.1248,lng:178.4501,tz:"Pacific/Fiji",method:"MuslimWorldLeague"},
};
const METHODS = {Karachi:"Karachi (Bangladesh, India, Pakistan)",MoonsightingCommittee:"Moonsighting Committee (UK, Ireland)",MuslimWorldLeague:"Muslim World League (Europe, others)",NorthAmerica:"ISNA (North America)",UmmAlQura:"Umm al-Qura (Saudi, Gulf)",Dubai:"Dubai (UAE)",Qatar:"Qatar",Kuwait:"Kuwait",Egyptian:"Egyptian",Turkey:"Turkey (Diyanet)",Singapore:"Singapore, Malaysia, Indonesia"};
const DEFAULT = {city:"dhaka",method:"Karachi",madhab:"hanafi"};
const P = [
  {k:"fajr",en:"Fajr",bn:"ফজর",f:2,chips:[["s","Sunnah","2"]]},
  {k:"dhuhr",en:"Dhuhr",bn:"যোহর",f:4,chips:[["b","Sunnah","4"],["s","Sunnah","2"],["n","Nafl","2"]]},
  {k:"asr",en:"Asr",bn:"আসর",f:4,chips:[["s","Sunnah","4"]]},
  {k:"maghrib",en:"Maghrib",bn:"মাগরিব",f:3,chips:[["s","Sunnah","2"],["n","Nafl","2"]]},
  {k:"isha",en:"Isha",bn:"এশা",f:4,chips:[["b","Sunnah","4"],["s","Sunnah","2"],["w","Witr","3"],["n","Nafl","2"]]}
];
const X = {k:"x",en:"Tahajjud & extra",bn:"তাহাজ্জুদ",chips:[["t","Tahajjud"],["i","Ishraq"],["d","Duha"],["a","Awwabin"]]};
const PTS = {f:10,q:5,s:3,b:2,w:3,n:2,t:5,i:2,d:2,a:2};
const H = 3600e3, DAY = 24*H, HISTORY_DAYS = 130;

const S = {nudges:[],nudgeTo:null,sb:null,session:null,myId:null,email:"",invited:false,admin:false,invites:[],requests:[],myRequest:null,lastSync:null,
  members:{},overlay:{},view:"today",dayOff:0,period:"7",open:null,readOnly:false,
  groups:[],gmembers:{},stats:{},excused:new Set(),gid:null,
  phase:"boot",err:"",pop:"",confirmRm:null};
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const flameSvg = (lit) => lit
  ? `<svg viewBox="0 0 64 76" aria-hidden="true"><use href="#flm" fill="url(#gF)"/><ellipse cx="25" cy="47" rx="3" ry="3.6" fill="#5A2440"/><ellipse cx="39" cy="47" rx="3" ry="3.6" fill="#5A2440"/><circle cx="26" cy="45.8" r="1" fill="#fff"/><circle cx="40" cy="45.8" r="1" fill="#fff"/><path d="M28.5 53q3.5 3.5 7 0" stroke="#5A2440" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="19" cy="53" r="3.6" fill="#FF7AA2" opacity=".55"/><circle cx="45" cy="53" r="3.6" fill="#FF7AA2" opacity=".55"/></svg>`
  : `<svg viewBox="0 0 64 76" aria-hidden="true"><use href="#flm" fill="var(--off)" stroke="var(--line)" stroke-width="2.5"/><path d="M21 48q4 3 8 0M35 48q4 3 8 0" stroke="var(--muted)" stroke-width="2.2" fill="none" stroke-linecap="round"/><text x="44" y="30" font-size="10" font-weight="800" fill="var(--muted)" font-family="sans-serif">z</text></svg>`;
const miniFlame = (n, lit=true) => `<span class="mini ${lit&&n?"":"off"}"><svg viewBox="0 0 64 76"><use href="#flm" fill="${lit&&n?"url(#gF)":"var(--line)"}"/></svg>${n}</span>`;
const watermark = () => `<p class="wm">made with <span aria-hidden="true">🌸</span> by ${esc(CONF.ownerName || "Shupti")}</p>`;
const hue = id => { let h=0; for (const c of String(id)) h=(h*31+c.charCodeAt(0))%360; return h; };
/* Nudges: ready-made messages to friends in your groups. Keep in sync with NUDGE_TEXT in the notify function. */
const NUDGES = {
  n1:["did u pray {w} yet?","{w} porsos?"],
  n2:["{w}'s almost over 👀","{w} er time sesh hoye jacche 👀"],
  n3:["pray {w} then come back to ur phone 😤","phone rakh, {w} por 😤"],
  n4:["wanna pray {w} together?","cholo eksathe {w} pori?"],
  n5:["did u pray {w} yet?","{w} porsos?"],
  h1:["mashaAllah 🥹","mashaAllah 🥹"],
  h2:["yesss 🙌","ufff consistency 👏"],
  h3:["ok consistency 👏","streak bachay rakhsos 🔥"],
  h4:["proud of u 🫶","proud of u 🫶"],
  h5:["proud of u 🫶","proud of u 🫶"],
  r1:["jazakAllah 🤍","jazakAllah 🤍"],
  r2:["going now","jaitesi"],
  r3:["already did 😌","already porsi 😌"],
  r4:["5 more mins 😭","5 min 😭"],
  g1:["{w} everyone 🕰️","{w} er time sobai 🕰️"],
  g2:["who's prayed {w}?","ke ke {w} porse?"],
  g3:["let's not break the streak guys","streak bhangish na keu"],
  g4:["everyone prayed {w} 🥳 mashaAllah","sobai {w} porse 🥳 mashaAllah"],
  g5:["everyone prayed {w} 🥳 mashaAllah","sobai {w} porse 🥳 mashaAllah"]};
// Old n5/h5/g5 only render past messages; new messages use 1–4.
const WQ = {fajr:["fajr","fajr"],dhuhr:["dhuhr","zohor"],asr:["asr","asr"],maghrib:["maghrib","magrib"],isha:["isha","esha"]};
const nudgeText = (kind, waqt) => { const i = typeof LANG!=="undefined" && LANG==="bn" ? 1 : 0;
  return (NUDGES[kind]?.[i] || "👋").replaceAll("{w}", WQ[waqt]?.[i] || waqt); };
const avatar = (id,name,crown) => `<span class="av" style="background:linear-gradient(140deg,hsl(${hue(id)} 85% 82%),hsl(${(hue(id)+50)%360} 80% 76%))">${crown?'<span class="crown" aria-hidden="true">👑</span>':""}${esc((name||"?").trim().charAt(0).toUpperCase())}</span>`;

/* ---------- dates & times ---------- */
const ymd = (d,tz) => new Intl.DateTimeFormat("en-CA",{timeZone:tz,year:"numeric",month:"2-digit",day:"2-digit"}).format(d);
const addDays = (ds,n) => { const t=new Date(ds+"T12:00:00Z"); t.setUTCDate(t.getUTCDate()+n); return t.toISOString().slice(0,10); };
const fmtT = (d,tz) => new Intl.DateTimeFormat("en-GB",{hour:"numeric",minute:"2-digit",hour12:true,timeZone:tz}).format(d).replace(/\s/," ");
const fmtDay = ds => new Date(ds+"T12:00:00Z").toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short",timeZone:"UTC"});
const fmtShortDT = (d,tz) => new Intl.DateTimeFormat("en-GB",{weekday:"short",hour:"numeric",minute:"2-digit",hour12:true,timeZone:tz}).format(d);
const dur = ms => { const m=Math.max(0,Math.round(ms/60000)); const h=Math.floor(m/60); return h? `${h}h ${m%60}m` : `${m}m`; };
const clock = ms => { const s=Math.max(0,Math.floor(ms/1000)); const h=Math.floor(s/3600), m=Math.floor(s%3600/60), x=s%60; return `${h}:${String(m).padStart(2,"0")}:${String(x).padStart(2,"0")}`; };
/* Where times are calculated for: a city from the list, or "custom" = the person's own (rounded) location. */
const DEVICE_TZ = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch { return ""; } })();
const TZ_ALIAS = {"America/Swift_Current":"America/Regina","Canada/Saskatchewan":"America/Regina","Australia/Lindeman":"Australia/Brisbane","Australia/Queensland":"Australia/Brisbane","Australia/NSW":"Australia/Sydney","Australia/ACT":"Australia/Sydney","Australia/Canberra":"Australia/Sydney","Europe/Jersey":"Europe/London","Europe/Guernsey":"Europe/London","Europe/Isle_of_Man":"Europe/London","Asia/Calcutta":"Asia/Kolkata","Asia/Dacca":"Asia/Dhaka","Europe/Belfast":"Europe/London"};
const tzOff = z => { try { const d = new Date(), f = new Intl.DateTimeFormat("en-US",{timeZone:z,hourCycle:"h23",year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric"}).formatToParts(d).reduce((o,p)=>(o[p.type]=p.value,o),{});
  return Math.round((Date.UTC(f.year,f.month-1,f.day,f.hour,f.minute) - d.getTime())/60000/15); } catch { return null; } };
function guessCity(){
  const tz = TZ_ALIAS[DEVICE_TZ] || DEVICE_TZ;
  const exact = Object.keys(CITIES).find(k => CITIES[k].tz===tz); if (exact) return exact;
  // Unknown zone: pick a listed city on the same clock today (the person can still choose theirs or share location).
  const mine = tzOff(tz); return Object.keys(CITIES).find(k => tzOff(CITIES[k].tz)===mine) || DEFAULT.city;
}
const cfgOf = m => {
  const custom = m?.city==="custom" && Number.isFinite(m?.lat) && Number.isFinite(m?.lng) && m?.tz;
  const city = custom ? "custom" : (CITIES[m?.city] ? m.city : guessCity());
  return {city, lat:custom?m.lat:null, lng:custom?m.lng:null, tz:custom?m.tz:null, place:custom?(m.place||"My location"):null,
    method: METHODS[m?.method] ? m.method : (CITIES[city]?.method || DEFAULT.method), madhab: m?.madhab==="shafi" ? "shafi" : "hanafi"};
};
const loc = cfg => cfg.city==="custom" ? {name:cfg.place, lat:cfg.lat, lng:cfg.lng, tz:cfg.tz} : CITIES[cfg.city];
function nearestCity(lat, lng){
  let best = null, bd = Infinity;
  for (const [k,c] of Object.entries(CITIES)){
    const dLat=(c.lat-lat)*Math.PI/180, dLng=(c.lng-lng)*Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat*Math.PI/180)*Math.cos(c.lat*Math.PI/180)*Math.sin(dLng/2)**2;
    const km = 12742*Math.asin(Math.sqrt(a)); if (km < bd){ bd = km; best = k; }
  }
  return {key:best, km:bd};
}
const cache = new Map();
function times(cfg, ds){
  const key = cfg.city+(cfg.lat??"")+","+(cfg.lng??"")+cfg.method+cfg.madhab+ds;
  if (cache.has(key)) return cache.get(key);
  const c = loc(cfg), [y,mo,d] = ds.split("-").map(Number);
  const co = new adhan.Coordinates(c.lat,c.lng);
  const p = adhan.CalculationMethod[cfg.method]();
  p.madhab = cfg.madhab==="shafi" ? adhan.Madhab.Shafi : adhan.Madhab.Hanafi;
  if (Math.abs(c.lat) > 48) p.highLatitudeRule = adhan.HighLatitudeRule.recommended(co);
  const t = new adhan.PrayerTimes(co,new Date(y,mo-1,d),p);
  const r = {fajr:t.fajr,sunrise:t.sunrise,dhuhr:t.dhuhr,asr:t.asr,maghrib:t.maghrib,isha:t.isha};
  cache.set(key,r); return r;
}
function appDay(cfg, now=new Date()){
  const tz = loc(cfg).tz, t = ymd(now,tz);
  return now < times(cfg,t).fajr ? addDays(t,-1) : t;
}
const ENDS = {fajr:"sunrise",dhuhr:"asr",asr:"maghrib",maghrib:"isha"};
function waqtEnd(cfg, ds, k){ return ENDS[k] ? times(cfg,ds)[ENDS[k]] : times(cfg,addDays(ds,1)).fajr; }
function chipStart(cfg, ds, k, c){
  const t = times(cfg,ds);
  if (k!=="x") return t[k];
  return c==="t" ? t.isha : c==="a" ? t.maghrib : new Date(+t.sunrise + SUNRISE_MIN*60e3);
}

/* ---------- data & scoring ---------- */
const meDoc = () => S.members[S.myId];
/* On the day someone joins, prayers that began before they joined only count if they log them. */
const preJoin = (m, ds, start) => !!(m && m.joined===ds && m.createdAt && start < new Date(m.createdAt));
/* Groups decide who sees whom. gmembers: {groupId: [userIds]} */
const groupIds = gid => (S.gmembers[gid] || []).filter(id => S.members[id]);
const isPub = id => S.members[id]?.isPublic !== false;
const pubIds = () => Object.keys(S.members).filter(isPub);
const coIds = () => [...new Set([S.myId, ...pubIds(), ...S.groups.flatMap(g => groupIds(g.id))])].filter(id => S.members[id]);
// Every group shares streaks and today's rings with its members.
const fullIds = () => new Set(S.groups.flatMap(g => groupIds(g.id)));
/* Whose today's rings you can see: group mates and public members. */
const seeIds = () => new Set([...fullIds(), ...pubIds()]);
const curGroup = () => S.gid==="all" ? null : (S.groups.find(g => g.id===S.gid) || null);
function codeOf(id, ds, k){
  if (id===S.myId && S.overlay[ds] && k in S.overlay[ds]) return S.overlay[ds][k];
  return S.members[id]?.days?.[ds]?.[k] || "";
}
function dayState(id, ds, now=new Date()){
  const m = S.members[id]; if (!m || (m.joined && ds < m.joined)) return {s:"na"};
  if (id===S.myId && S.excused.has(ds) && !P.every(p => codeOf(id,ds,p.k).includes("f"))) return {s:"ex", open:[]};
  const cfg = cfgOf(m), t = times(cfg,ds); const open = [];
  for (const p of P){
    if (codeOf(id,ds,p.k).includes("f")) continue;
    if (preJoin(m, ds, t[p.k])) continue;
    const close = new Date(+t[p.k]+DAY);
    if (now >= close) return {s:"miss"};
    if (now >= t[p.k]) open.push({p, close});
  }
  const done = P.every(p => codeOf(id,ds,p.k).includes("f"));
  return {s: done ? "done" : "open", open};
}
function streakFor(id, now=new Date()){ return id===S.myId ? streakOf(id,now) : (S.stats[id]?.streak ?? 0); }
function streakOf(id, now=new Date()){
  const m = S.members[id]; if (!m) return 0;
  let n = 0, d = appDay(cfgOf(m),now);
  for (let i=0;i<1500;i++, d=addDays(d,-1)){
    const st = dayState(id,d,now).s;
    if (st==="na" || st==="miss") break;
    if (st==="done") n++;
  }
  return n;
}
/* Flame badge next to a name: their current all-5 streak. */
const bestBadge = id => miniFlame(streakFor(id));
/* Milestone badges for the all-5 streak. */
const MILESTONES = [
  {n:7,   e:"🌱", t:"One week",  bn:"এক সপ্তাহ"},
  {n:40,  e:"🌙", t:"40 days",   bn:"৪০ দিন"},
  {n:100, e:"💯", t:"100 days",  bn:"১০০ দিন"},
  {n:365, e:"🏆", t:"One year",  bn:"এক বছর"}
];
function topBadge(id){
  const best = id===S.myId ? bestStreak(id) : (S.stats[id]?.best || 0);
  return [...MILESTONES].reverse().find(x => best >= x.n) || null;
}
const badgeChip = id => { const b = topBadge(id); return b ? `<span class="mbadge" title="${b.t} streak badge">${b.e}</span>` : ""; };
function bestStreak(id, now=new Date()){
  const m = S.members[id]; if (!m?.joined) return streakOf(id,now);
  const today = appDay(cfgOf(m),now); let best=0, run=0;
  for (let d=m.joined, i=0; d<=today && i<1500; d=addDays(d,1), i++){
    const st = dayState(id,d,now).s;
    if (st==="done"){ run++; best=Math.max(best,run); } else if (st==="miss") run=0;
  }
  return best;
}
/* A group's streak is as long as its shortest member streak: everyone keeps it alive together. */
function groupStreak(gid, now=new Date()){
  const ids = groupIds(gid); if (ids.length < 2) return null;
  return Math.min(...ids.map(id => streakFor(id,now)));
}
function dayStats(id, cfg, ds, now){
  let due=0, done=0, pts=0; const t = times(cfg,ds);
  const ex = id===S.myId && S.excused.has(ds), m = S.members[id];
  for (const p of P){ const c=codeOf(id,ds,p.k); if (t[p.k] <= now){ const f = c.includes("f"); if (f || (!ex && !preJoin(m,ds,t[p.k]))) due++; if (f) done++; } for (const ch of c) pts += PTS[ch]||0; }
  for (const ch of codeOf(id,ds,"x")) pts += PTS[ch]||0;
  return {due,done,pts};
}
function memberSummary(id, period, now=new Date()){
  const m = S.members[id], cfg = cfgOf(m), today = appDay(cfg,now);
  let start = period==="7" ? addDays(today,-6) : period==="all" ? (m?.joined || today) : today.slice(0,8)+"01";
  if (m?.joined && m.joined > start) start = m.joined;
  let due=0, done=0, pts=0;
  for (let d=start; d<=today; d=addDays(d,1)){ const s=dayStats(id,cfg,d,now); due+=s.due; done+=s.done; pts+=s.pts; }
  const dots = P.map(p => codeOf(id,today,p.k).includes("f") ? "d" : (now >= waqtEnd(cfg,today,p.k) ? "m" : ""));
  return {due,done,pts,streak:streakOf(id,now),pct:due?done/due*100:null,dots,cfg};
}
function summaryFor(id, period){
  if (id===S.myId){ const s = memberSummary(id, period); s.full = true; return s; }
  const st = S.stats[id] || {}, full = fullIds().has(id), see = full || isPub(id);
  const due = period==="7" ? st.wk_due||0 : period==="all" ? st.f_due||0 : st.mo_due||0, done = period==="7" ? st.wk_done||0 : period==="all" ? st.f_done||0 : st.mo_done||0;
  let dots = null;
  if (see){ const cfg = cfgOf(S.members[id]), today = appDay(cfg), now = new Date(); dots = P.map(p => { const c = codeOf(id,today,p.k); return c.includes("f") ? "d" : c.includes("q") ? "q" : (now >= waqtEnd(cfg,today,p.k) ? "m" : ""); }); }
  return {due, done, pts: st.mo_pts||0, ptsMonthOnly: period!=="month", streak: st.streak||0, pct: due ? done/due*100 : null, dots, full};
}
function myStats(now=new Date()){
  const w = memberSummary(S.myId,"7",now), mo = memberSummary(S.myId,"month",now);
  const all = memberSummary(S.myId,"all",now);
  const st = {user_id:S.myId, streak:streakOf(S.myId,now), best:bestStreak(S.myId,now), wk_due:w.due, wk_done:w.done, mo_due:mo.due, mo_done:mo.done, mo_pts:mo.pts};
  if (!S.noTally) Object.assign(st, {f_due:all.due, f_done:all.done});
  return st;
}
let statsT = null;
function pushMyStats(){
  clearTimeout(statsT);
  statsT = setTimeout(async () => {
    if (!meDoc()) return;
    const st = myStats(), prev = S.stats[S.myId];
    if (prev && Object.keys(st).every(k => prev[k]===st[k])) return;
    let {error} = await S.sb.from("member_stats").upsert({...st, updated_at:new Date().toISOString()}, {onConflict:"user_id"});
    if (error && /f_due|f_done|column/i.test(error.message||"")){   // database not updated for the fardh tally yet
      S.noTally = true; delete st.f_due; delete st.f_done;
      ({error} = await S.sb.from("member_stats").upsert({...st, updated_at:new Date().toISOString()}, {onConflict:"user_id"}));
    }
    if (!error) S.stats[S.myId] = st;
  }, 800);
}
function grade(pct){
  if (pct==null) return "–";
  return pct>=95?"A+":pct>=90?"A":pct>=85?"A−":pct>=80?"B+":pct>=75?"B":pct>=70?"B−":pct>=65?"C+":pct>=60?"C":pct>=50?"D":"F";
}

/* ---------- Supabase data layer ---------- */
function rowToMember(r, prev){
  return {createdAt:r.created_at, name:r.name, city:r.city, lat:r.lat, lng:r.lng, tz:r.tz, place:r.place, method:r.method, madhab:r.madhab, showExtras:r.show_extras, isPublic:r.is_public !== false,
    notifyStart:r.notify_start, notifyEnd:r.notify_end, notifyJumuah:!!r.notify_jumuah, notifyRecap:r.notify_recap !== false, quietStart:r.quiet_start, quietEnd:r.quiet_end, lang:r.lang, joined:r.joined, days: prev?.days || {}};
}
function applyLog(r){
  if (r.updated_at && (!S.lastSync || r.updated_at > S.lastSync)) S.lastSync = r.updated_at;
  const m = S.members[r.user_id]; if (!m) return;
  (m.days[r.day] ||= {})[r.waqt] = r.code || "";
}
async function loadGroups(){
  const [{data:gs, error:e1}, {data:gm, error:e2}, {data:st, error:e3}] = await Promise.all([
    S.sb.from("groups").select("*").order("created_at"), S.sb.from("group_members").select("group_id,user_id"), S.sb.from("member_stats").select("*")]);
  // Before the groups update has been run on the database, carry on without groups.
  if (e1 || e2 || e3){ console.warn("groups not available yet", e1 || e2 || e3); S.groups = []; S.gmembers = {}; S.stats = {}; return; }
  S.groups = gs || []; S.gmembers = {};
  for (const r of gm || []) (S.gmembers[r.group_id] ||= []).push(r.user_id);
  S.stats = {}; for (const r of st || []) S.stats[r.user_id] = r;
  if (S.gid!=="all" && !S.groups.some(g => g.id===S.gid)) S.gid = S.groups[0]?.id || "all";
}
async function loadNudges(){
  const {data, error} = await S.sb.from("nudges").select("*").gte("created_at", new Date(Date.now()-48*3600e3).toISOString()).order("created_at",{ascending:false}).limit(300);
  if (error){ S.noNudges = true; S.nudges = []; return; }
  S.noNudges = false; S.nudges = data || [];
}
async function loadAll(){
  const {data:mem, error:e1} = await S.sb.from("members").select("*");
  if (e1) throw e1;
  const next = {};
  for (const r of mem) next[r.id] = rowToMember(r);
  S.members = next;
  await loadGroups();
  await loadNudges();
  const {data:ex} = await S.sb.from("excused").select("day").eq("user_id", S.myId);
  S.excused = new Set((ex||[]).map(r => r.day));
  const {data:qz, error:qe} = await S.sb.from("qaza").select("waqt,owed,done").eq("user_id", S.myId);
  S.qazaReady = !qe; S.qaza = {}; for (const r of qz||[]) S.qaza[r.waqt] = {owed:r.owed, done:r.done};
  const since = addDays(new Date().toISOString().slice(0,10), -HISTORY_DAYS);
  for (let from=0; ; from+=1000){
    const {data, error} = await S.sb.from("logs").select("user_id,day,waqt,code,updated_at").gte("day",since).order("day").range(from, from+999);
    if (error) throw error;
    data.forEach(applyLog);
    if (data.length < 1000) break;
  }
  // Your own older fardh, so "since you joined" stays right after months of use.
  for (let from=0; ; from+=1000){
    const {data, error} = await S.sb.from("logs").select("user_id,day,waqt,code,updated_at").eq("user_id",S.myId).lt("day",since).order("day").range(from, from+999);
    if (error) break;
    data.forEach(applyLog);
    if (data.length < 1000) break;
  }
}
/* Coming back to the app: fetch only what changed since we last looked (keeps data use tiny). */
async function syncChanges(){
  if (!S.lastSync){ await loadAll(); return; }
  const {data:mem, error:e1} = await S.sb.from("members").select("*");
  if (e1) throw e1;
  const next = {};
  for (const r of mem) next[r.id] = rowToMember(r, S.members[r.id]);
  S.members = next;
  await loadGroups();
  await loadNudges();   // nudges sent while the app was in the background
  for (let from=0; ; from+=1000){
    const {data, error} = await S.sb.from("logs").select("user_id,day,waqt,code,updated_at").gt("updated_at", S.lastSync).order("updated_at").range(from, from+999);
    if (error) throw error;
    data.forEach(applyLog);
    if (data.length < 1000) break;
  }
}
let channel = null;
function subscribeLive(){
  if (channel) return;
  channel = S.sb.channel("board")
    .on("postgres_changes",{event:"*",schema:"public",table:"logs"}, ({eventType,new:n,old:o}) => {
      if (eventType==="DELETE"){ const m=S.members[o.user_id]; if (m?.days?.[o.day]) delete m.days[o.day][o.waqt]; }
      else applyLog(n);
      scheduleRender();
    })
    .on("postgres_changes",{event:"*",schema:"public",table:"members"}, ({eventType,new:n,old:o}) => {
      if (eventType==="DELETE") delete S.members[o.id];
      else S.members[n.id] = rowToMember(n, S.members[n.id]);
      scheduleRender();
    });
  channel.on("postgres_changes",{event:"INSERT",schema:"public",table:"nudges"}, ({new:n}) => {
      if (!S.nudges.some(x => x.id===n.id)) S.nudges.unshift(n);
      if (n.to_id===S.myId || (!n.to_id && n.from_id!==S.myId)) sticker(n);
      scheduleRender();
    });
  channel.on("postgres_changes",{event:"*",schema:"public",table:"member_stats"}, ({eventType,new:n,old:o}) => {
      if (eventType==="DELETE") delete S.stats[o.user_id]; else S.stats[n.user_id] = n;
      scheduleRender();
    });
  let gT = null;
  const regroup = () => { clearTimeout(gT); gT = setTimeout(async () => { try { await syncChanges(); scheduleRender(); } catch {} }, 400); };
  channel.on("postgres_changes",{event:"*",schema:"public",table:"group_members"}, regroup)
         .on("postgres_changes",{event:"*",schema:"public",table:"groups"}, regroup);
  if (S.admin) channel.on("postgres_changes",{event:"*",schema:"public",table:"join_requests"}, ({eventType,new:n,old:o}) => {
      if (eventType==="DELETE") S.requests = S.requests.filter(r => r.user_id !== o.user_id);
      else if (!S.requests.some(r => r.user_id === n.user_id)){ S.requests.push(n); toast(`💌 ${n.name} wants to join`); }
      if (S.view==="settings"){ S.forceForm = true; } scheduleRender();
    });
  channel.subscribe();
}
let rT = null;
function scheduleRender(){ clearTimeout(rT); rT = setTimeout(()=>{ if (S.view!=="settings" && S.view!=="alerts") render(); else renderSky(); }, 120); }

/* writes: one batch at a time, debounced */
let pending = {}, writing = false, timer = null;
function queue(ds,k,code){
  (S.overlay[ds] ||= {})[k] = code;
  (pending[ds] ||= {})[k] = code;
  clearTimeout(timer); timer = setTimeout(flush,500);
}
async function flush(){
  if (writing || !Object.keys(pending).length) return;
  writing = true;
  const batch = pending; pending = {};
  const rows = [];
  for (const d in batch) for (const k in batch[d]) rows.push({user_id:S.myId, day:d, waqt:k, code:batch[d][k], updated_at:new Date().toISOString()});
  let ok = false;
  try {
    const {error} = await S.sb.from("logs").upsert(rows,{onConflict:"user_id,day,waqt"});
    if (error) throw error;
    ok = true;
    rows.forEach(applyLog); pushMyStats();
  } catch(e){
    if (!navigator.onLine){ for (const d in batch) pending[d] = {...batch[d], ...(pending[d]||{})}; toast("You're offline. Will save when you're back."); }
    else if (/no longer be changed/i.test(e?.message||"")) toast("That day is locked now.");
    else toast("Couldn't save that. Check your connection and try again.");
  } finally {
    writing = false;
    for (const d in batch) for (const k in batch[d]) if (!(pending[d] && k in pending[d]) && S.overlay[d] && (ok || navigator.onLine)) delete S.overlay[d][k];
    if (Object.keys(pending).length) setTimeout(flush, 3000);
    render();
  }
}
addEventListener("online", () => flush());
function toast(msg){ const t=$("toast"); t.textContent=msg; t.hidden=false; clearTimeout(toast.t); toast.t=setTimeout(()=>t.hidden=true,4200); }

/* ---------- confetti ---------- */
function celebrate(){
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cv = $("fx"); cv.hidden = false; const dpr = devicePixelRatio||1;
  cv.width = innerWidth*dpr; cv.height = innerHeight*dpr; const g = cv.getContext("2d"); g.scale(dpr,dpr);
  const cs = getComputedStyle(document.documentElement);
  const cols = ["--gold","--rose","--accent","--lav"].map(v=>cs.getPropertyValue(v).trim()).concat("#FFE28A","#7B6CF6");
  const ps = Array.from({length:110},()=>({x:innerWidth/2,y:innerHeight*0.35,vx:(Math.random()-.5)*11,vy:-Math.random()*11-4,r:Math.random()*5+3,c:cols[Math.floor(Math.random()*cols.length)],a:Math.random()*6,s:Math.random()*.3-.15}));
  const t0 = performance.now();
  (function f(t){
    const k = (t-t0)/1600; g.clearRect(0,0,innerWidth,innerHeight);
    for (const p of ps){ p.vy+=.32; p.x+=p.vx; p.y+=p.vy; p.vx*=.99; p.a+=p.s; g.save(); g.globalAlpha=Math.max(0,1-k); g.translate(p.x,p.y); g.rotate(p.a); g.fillStyle=p.c; g.fillRect(-p.r/2,-p.r/4,p.r,p.r/2); g.restore(); }
    if (k<1) requestAnimationFrame(f); else { g.clearRect(0,0,innerWidth,innerHeight); cv.hidden = true; }
  })(t0);
}

/* ---------- makruh (forbidden) times: approximate windows ---------- */
const MIN = 60e3, SUNRISE_MIN = 15, ZAWAL_MIN = 10, SUNSET_MIN = 15;
function makruhNow(t, now){
  if (now >= t.sunrise && now < new Date(+t.sunrise + SUNRISE_MIN*MIN)) return {why:"the sun is rising", until:new Date(+t.sunrise + SUNRISE_MIN*MIN)};
  if (now >= new Date(+t.dhuhr - ZAWAL_MIN*MIN) && now < t.dhuhr) return {why:"the sun is at its highest (zawal)", until:t.dhuhr};
  if (now >= new Date(+t.maghrib - SUNSET_MIN*MIN) && now < t.maghrib) return {why:"the sun is setting", until:t.maghrib, asr:true};
  return null;
}

/* ---------- sky hero ---------- */
/* Hijri date built from parts, so no browser can add the wrong era (some show "BC"). */
function hijriDate(now, tz){
  for (const cal of ["islamic-umalqura","islamic","islamic-civil"]){
    try {
      const f = new Intl.DateTimeFormat("en-GB-u-ca-"+cal,{day:"numeric",month:"long",year:"numeric",timeZone:tz});
      if (!f.resolvedOptions().calendar.startsWith("islamic")) continue;
      const p = Object.fromEntries(f.formatToParts(now).map(x => [x.type, x.value]));
      const y = parseInt(String(p.year||p.relatedYear||"").replace(/\D/g,""),10);
      if (!p.day || !p.month || !(y > 1400 && y < 1600)) continue;
      return `${p.day} ${p.month} ${y} AH`;
    } catch {}
  }
  return "";
}
function renderSky(){
  const m = meDoc(), cfg = cfgOf(m), c = loc(cfg), now = new Date();
  const today = appDay(cfg,now), t = times(cfg,today), nextT = times(cfg,addDays(today,1));
  const seq = [["fajr",t.fajr],["sunrise",t.sunrise],["dhuhr",t.dhuhr],["asr",t.asr],["maghrib",t.maghrib],["isha",t.isha],["fajr",nextT.fajr]];
  let i = 0; for (let j=0;j<seq.length-1;j++) if (seq[j][1] <= now) i = j;
  const cur = seq[i][0], endAt = seq[i+1][1], startAt = seq[i][1];
  // Isha lasts until Fajr. The last third of the night (Maghrib→Fajr) is the best time for tahajjud.
  const lastThird = new Date(+nextT.fajr - (nextT.fajr - t.maghrib)/3);
  const late = cur==="isha" && now >= lastThird;
  const N = {fajr:["Fajr","ফজর","fajr"],sunrise:["Ishraq & Duha","ইশরাক","morning"],dhuhr:["Dhuhr","যোহর","dhuhr"],asr:["Asr","আসর","asr"],maghrib:["Maghrib","মাগরিব","maghrib"],isha:["Isha","এশা","isha"]};
  const [n, bn, cls] = N[cur];
  // The next moment after Fajr is sunrise (makruh), not Ishraq, so call it what it is.
  const nextName = i+1===6 ? "Fajr" : seq[i+1][0]==="sunrise" ? "Sunrise" : (N[seq[i+1][0]]?.[0] || "");
  const pct = Math.min(100, (now-startAt)/(endAt-startAt)*100);
  const hijri = hijriDate(now, c.tz);
  const beads = P.map(p => {
    const done = codeOf(S.myId,today,p.k).includes("f"), isCur = cur===p.k, miss = !done && now >= waqtEnd(cfg,today,p.k);
    return `<div class="bead ${done?"done":""} ${isCur?"cur":""} ${miss?"miss":""}"><b>${done?"✓":""}</b><span>${p.en}</span><span class="t">${fmtT(t[p.k],c.tz).replace(/ ?[ap]m/i,"")}</span></div>`;
  }).join("");
  const sky = $("sky");
  const isFardh = P.some(p=>p.k===cur);
  const fresh = isFardh && now - startAt < 20*60e3 && !codeOf(S.myId,today,cur).includes("f");
  const alert = fresh ? `<div class="alert" role="status"><span>🌸 It's ${n} time!</span>${meDoc() && !S.readOnly ? `<button data-act="tog" data-ds="${today}" data-k="${cur}" data-c="f">I prayed ✓</button>` : ""}</div>` : "";
  const mk = makruhNow(t, now);
  const waqtKey = today + cur + late + (mk ? "mk" : "");
  // Only announce a new waqt when time moves on, not when the city changes (e.g. after signing in).
  if (S.lastWaqt && S.lastWaqt !== waqtKey && S.lastPlace === c.name && isFardh) toast(`🌸 It's ${n} time! Go pray, then tap Fardh.`);
  S.lastWaqt = waqtKey; S.lastPlace = c.name;
  const countHtml = `${clock(endAt-now)}<small>${cur==="sunrise" ? "No fardh namaz now · until Dhuhr" : `left in this waqt · ${nextName} at ${fmtT(endAt,c.tz)}`}</small>`;
  const key = waqtKey + beads + alert + hijri + c.name;
  if (key === S.skyKey){ sky.querySelector(".count").innerHTML = countHtml; sky.querySelector(".prog i").style.width = pct.toFixed(1)+"%"; return; }
  S.skyKey = key;
  sky.className = "sky sky-" + (late ? "night" : cls);
  sky.innerHTML = `<i class="spark" style="top:14%;right:16%;font-size:18px">✦</i><i class="spark" style="top:44%;right:8%;font-size:12px;animation-delay:.9s">✦</i><i class="spark" style="top:30%;right:32%;font-size:10px;animation-delay:1.6s">✦</i><div class="row1"><span>${esc(c.name)} · ${fmtDay(ymd(now,c.tz))}</span><span>${esc(hijri)}</span></div>
    <div class="now"><h2>${cur==="sunrise" ? (mk ? "Sunrise" : "Ishraq & Duha") : n}</h2><span class="bn">${cur==="sunrise" && mk ? "সূর্যোদয়" : bn}</span></div>
    ${mk ? `<div class="makruh">⛔ Makruh time: don't pray until ${fmtT(mk.until,c.tz)}, ${mk.why}.${mk.asr ? " Exception: if you haven't prayed today's Asr, pray it now. It's still valid." : ""}</div>` : ""}
    ${cur==="fajr" && !mk ? `<div class="sub">🌅 Sunrise ${fmtT(t.sunrise,c.tz)} · Ishraq from ${fmtT(new Date(+t.sunrise + SUNRISE_MIN*MIN),c.tz)}</div>` : ""}
    ${cur==="sunrise" && !mk ? `<div class="sub">☀️ Ishraq and Duha time · Dhuhr at ${fmtT(t.dhuhr,c.tz)}</div>` : ""}
    ${cur==="isha" ? `<div class="sub">${late ? "🌙 Last third of the night · best time for tahajjud" : `🌙 Tahajjud's best time starts ${fmtT(lastThird,c.tz)}`}</div>` : ""}
    <div class="count num" role="timer">${countHtml}</div>
    <div class="prog"><i style="width:${pct.toFixed(1)}%"></i></div>
    <div class="beads">${beads}</div>${alert}`;
}

/* ---------- streak card & friends ---------- */
function streakCard(){
  const m = meDoc(); if (!m) return "";
  const now = new Date(), cfg = cfgOf(m), tz = loc(cfg).tz, today = appDay(cfg,now);
  const n = streakOf(S.myId,now), st = dayState(S.myId,today,now), ys = dayState(S.myId,addDays(today,-1),now);
  const open = [...(ys.open||[]), ...(st.open||[])].sort((a,b)=>a.close-b.close);
  const doneToday = P.filter(p => codeOf(S.myId,today,p.k).includes("f")).length;
  const lit = st.s==="done";
  const nextClose = open[0]?.close, risk = n>0 && nextClose && nextClose-now < 3*H;
  let head, msg;
  if (lit){ head = `${n}-day streak`; msg = "All 5 fardh done today. Your streak is safe."; }
  else if (st.s==="ex"){ head = n ? `${n}-day streak` : "Streak paused"; msg = "Today is excused, so your streak is paused, not broken. Only you can see this."; }
  else if (open.length){ head = n ? `${n}-day streak` : "Start a streak"; msg = `Log ${open[0].p.en} by ${fmtShortDT(open[0].close,tz)} ${n?"to keep it":"to stay on track"}.`; }
  else if (n){ head = `${n}-day streak`; msg = `${doneToday} of 5 fardh today. Keep going to add day ${n+1}.`; }
  else { head = "Start a streak"; msg = "Pray all 5 fardh in a day to light the flame."; }
  const week = Array.from({length:7},(_,i)=>{
    const d = addDays(today,i-6), s = dayState(S.myId,d,now).s;
    const wd = new Date(d+"T12:00:00Z").toLocaleDateString("en-GB",{weekday:"narrow",timeZone:"UTC"});
    return `<div class="wd ${s} ${i===6?"today":""}" title="${fmtDay(d)}${s==="ex"?" · excused (only you see this)":""}"><i>${s==="done"?`<svg viewBox="0 0 64 76"><use href="#flm" fill="url(#gF)"/></svg>`:s==="ex"?"⏸":""}</i>${wd}</div>`;
  }).join("");
  return `<section class="streak" aria-label="Your streak">
    <div class="flame ${lit?"lit":"dim"}">${flameSvg(lit || n>0)}<span class="n num">${n}</span>${risk?`<span class="hg" title="Streak ends soon">⌛</span>`:""}</div>
    <div><h3>${head}</h3><p class="msg ${risk?"risk":""}" style="margin:2px 0 0">${msg}</p>${visPill()}</div>
    <div class="week">${week}</div>${tallyRow()}</section>`;
}
function tallyRow(){
  const t = memberSummary(S.myId,"all"), pct = t.due ? Math.round(t.done/t.due*100) : 0;
  let qz = 0; { const m = meDoc(); if (m?.joined) for (let d = m.joined, i=0; i < 4000 && d <= appDay(cfgOf(m)); d = addDays(d,1), i++) for (const p of P){ const c = codeOf(S.myId,d,p.k); if (!c.includes("f") && c.includes("q")) qz++; } }
  return `<div class="tally"><div class="tl"><span class="tlabel">Fardh since you joined</span><span class="tnum num"><b>${t.done}</b>/${t.due}</span></div>
    <div class="tbar"><i style="width:${t.due?t.done/t.due*100:0}%"></i></div>
    <p class="note" style="margin:0">${t.due ? (t.done===t.due ? `Every fardh so far ✨ ${pct}%` : `${pct}% · ${t.due-t.done} missed${qz ? `, ${qz} made up as qaza 🤲` : ""}`) : "Your first fardh will show here."}</p></div>`;
}
function visPill(){
  const pub = isPub(S.myId), sure = S.confirmVis, n = S.groups.length;
  const label = sure ? (pub ? "Make private? Tap again" : "Make public? Tap again") : (pub ? "🌍 Public" : "🔒 Private");
  return `<div class="pills"><button class="vispill ${sure?"sure":""}" data-act="vis" title="${pub?"You're on the Everyone board":"Hidden from the Everyone board. Your groups still see you"}">${label}</button><button class="vispill" data-act="tab" data-tab="board">👥 ${n} group${n===1?"":"s"}</button></div>`;
}
/* Which group to send a nudge through: the one you're looking at, else any you share. */
function nudgeGroup(id, gid){
  if (S.noNudges) return null;
  if (gid && gid!=="all") return groupIds(gid).includes(id) ? gid : null;
  return S.groups.find(g => groupIds(g.id).includes(id) && groupIds(g.id).includes(S.myId))?.id || null;
}
/* The fardh a nudge is about: their latest waqt that has started today. */
function nudgeTarget(id){
  const m = S.members[id], cfg = cfgOf(m), now = new Date(), day = appDay(cfg,now), t = times(cfg,day);
  let p = P[0]; for (const x of P) if (t[x.k] <= now) p = x;
  return {day, waqt:p.k, p, prayed: codeOf(id,day,p.k).includes("f")};
}
const myNudge = (to, day, waqt) => S.nudges.find(n => n.from_id===S.myId && n.to_id===to && n.day===day && n.waqt===waqt && !n.reply_to);
function groupSheet(gid){
  const g = S.groups.find(x => x.id===gid); if (!g) return "";
  const tg = nudgeTarget(S.myId), sent = S.nudges.find(n => n.from_id===S.myId && !n.to_id && n.group_id===gid && n.day===tg.day && n.waqt===tg.waqt);
  return `<div class="sheet-bg" data-act="nudgeclose"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="Message everyone in ${esc(g.name)}">
    <div class="shead"><span class="av gav">📢</span><div><b data-notr>${esc(g.name)}</b><small>Everyone · ${groupIds(gid).length - 1} friends</small></div><button class="x" data-act="nudgeclose" aria-label="Close">✕</button></div>
    <p class="slabel">Message the whole group 📢</p>
    ${sent ? `<div class="nsent">Sent ✓ <span data-notr>${esc(nudgeText(sent.kind, sent.waqt))}</span></div><p class="note">One group message per namaz. Try again at the next waqt 😌</p>`
      : `<div class="nchips">${["g1","g2","g3","g4"].map((k,i) => `<button class="nchip c${i}" data-notr data-act="nudgesend" data-k="${k}">${esc(nudgeText(k, tg.waqt))}</button>`).join("")}</div>`}</div>`;
}
function nudgeSheet(){
  if (S.nudgeTo.all) return groupSheet(S.nudgeTo.gid);
  const {id, gid} = S.nudgeTo, m = S.members[id]; if (!m) return "";
  const tg = nudgeTarget(id), sent = myNudge(id, tg.day, tg.waqt);
  const keys = tg.prayed ? ["h1","h2","h3","h4"] : ["n1","n2","n3","n4"];
  const status = tg.prayed ? `prayed ${tg.p.en} ✓` : `${tg.p.en}: not logged yet`;
  return `<div class="sheet-bg" data-act="nudgeclose"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="Send ${esc(m.name||"them")} a nudge">
    <div class="shead">${avatar(id,m.name)}<div><b data-notr>${esc(m.name||"Someone")}</b><small>${status}</small></div><button class="x" data-act="nudgeclose" aria-label="Close">✕</button></div>
    <p class="slabel">${tg.prayed ? "Hype them up ✨" : "Give them a nudge 👉"}</p>
    ${sent ? `<div class="nsent">Sent ✓ <span data-notr>${esc(nudgeText(sent.kind, sent.waqt))}</span></div><p class="note">One per namaz, so nobody gets spammed. Try again at the next waqt 😌</p>`
      : `<div class="nchips">${keys.map((k,i) => `<button class="nchip c${i}" data-notr data-act="nudgesend" data-k="${k}">${esc(nudgeText(k, tg.waqt))}</button>`).join("")}</div>`}
    <button class="ghost slink" data-act="openfr" data-gid="${esc(gid)}" data-id="${esc(id)}">See their month →</button></div>`;
}
function nudgeFeed(gid){
  if (S.noNudges) return "";
  const list = S.nudges.filter(n => n.group_id===gid).slice(0,12);
  const allBtn = groupIds(gid).length > 1 ? `<button class="allbtn" data-act="nudgeall" data-gid="${esc(gid)}">📢 Message everyone</button>` : "";
  if (!list.length) return `<section class="feed"><div class="sechead"><h3>💬 Nudges</h3>${allBtn}</div><p class="note">Tap a friend's ring above to nudge them or hype them up.</p></section>`;
  const replied = new Set(S.nudges.filter(n => n.reply_to && n.from_id===S.myId).map(n => n.reply_to));
  const nm = id => id===S.myId ? "You" : esc(S.members[id]?.name || "Someone");
  return `<section class="feed"><div class="sechead"><h3>💬 Nudges</h3>${allBtn}</div>${list.map(n => {
    const forMe = n.to_id===S.myId || (!n.to_id && n.from_id!==S.myId);
    const canReply = forMe && !n.reply_to && !replied.has(n.id);
    return `<div class="nrow ${forMe?"tome":""} ${n.kind[0]}">
      <div class="nmeta"><span data-notr>${nm(n.from_id)}</span> → ${n.to_id ? `<span data-notr>${nm(n.to_id)}</span>` : "📢 everyone"} · ${ago(n.created_at)}</div>
      <div class="nbubble" data-notr>${esc(nudgeText(n.kind, n.waqt))}</div>
      ${canReply ? `<div class="rchips">${["r1","r2","r3","r4"].map(k => `<button class="rchip" data-notr data-act="nudgereply" data-id="${n.id}" data-k="${k}">${esc(nudgeText(k, n.waqt))}</button>`).join("")}</div>` : ""}</div>`; }).join("")}</section>`;
}
async function sendNudge(row){
  const {data, error} = await S.sb.from("nudges").insert(row).select().single();
  if (error){ toast(/duplicate|unique/i.test(error.message||"") ? "Already sent one for this namaz 😌" : "Couldn't send that. Try again."); return false; }
  if (!S.nudges.some(x => x.id===data.id)) S.nudges.unshift(data);
  return true;
}
function sticker(n){
  try { localStorage.setItem("nb-nudge-seen", n.created_at); } catch {}
  let el = $("sticker"); if (!el){ el = document.createElement("div"); el.id = "sticker"; el.setAttribute("role","status"); document.body.appendChild(el); }
  const txt = nudgeText(n.kind, n.waqt), emo = ({n:"👉",h:"✨",r:"💬",g:"📢"})[n.kind[0]] || "💌";
  el.innerHTML = `<div class="stk ${n.kind[0]}"><span class="se">${emo}</span><div><small data-notr>${esc(S.members[n.from_id]?.name || "A friend")}</small><b data-notr>${esc(txt)}</b></div></div>`;
  el.className = "show"; clearTimeout(sticker.t); sticker.t = setTimeout(() => el.className = "", 5200);
  if (n.kind[0]==="h") celebrate();
}

/* Home: you + public members. A group's rings show inside that group on the Board. */
function friendsStrip(){
  const ids = [...new Set([S.myId, ...pubIds()])].filter(id => S.members[id]);
  if (ids.length < 2) return "";
  return ringStrip(ids, "🌍 Everyone today", "all");
}
function ringStrip(ids, title, gid){
  const now = new Date(), see = seeIds();
  const rows = ids.map(id => { const m=S.members[id], cfg=cfgOf(m), today=appDay(cfg,now), seeDay = id===S.myId || see.has(id);
    return {id, m, seeDay, n: seeDay ? P.filter(p=>codeOf(id,today,p.k).includes("f")).length : 0, s:streakFor(id,now)}; })
    .sort((a,b)=> (b.id===S.myId)-(a.id===S.myId) || b.n-a.n || b.s-a.s);
  return `<section class="friends"><div class="sechead"><h3>${title}</h3><p>Ring = today's fardh</p></div><div class="fstrip">${rows.map(r=>`
    <button class="fr" data-act="${r.id!==S.myId && nudgeGroup(r.id, gid) ? "nudge" : "openfr"}" data-gid="${esc(gid)}" data-id="${esc(r.id)}" aria-label="${esc(r.m.name||"Someone")}: ${r.n} of 5 fardh today">
      <span class="ring ${r.seeDay?"":"plain"} ${r.seeDay&&r.n===5?"full":""}" style="--p:${r.n*20}%">${avatar(r.id,r.m.name)}${r.seeDay?`<span class="cnt num">${r.n}/5</span>`:""}</span>
      <span class="fn">${r.id===S.myId?"You":esc(r.m.name||"Someone")}${badgeChip(r.id)}</span>${bestBadge(r.id)}</button>`).join("")}</div></section>`;
}

/* Phone clock is in a different time zone from the saved city: offer a one-tap switch. */
function tzBanner(){
  const m = meDoc(); if (!m || !DEVICE_TZ) return "";
  const cfg = cfgOf(m), here = loc(cfg);
  if (tzOff(here.tz) === tzOff(DEVICE_TZ)) return "";
  const key = `${cfg.city}|${DEVICE_TZ}`; let dismissed = ""; try { dismissed = localStorage.getItem("nb-tzok") || ""; } catch {}
  if (dismissed === key) return "";
  const g = guessCity(), gc = CITIES[g], fits = gc && tzOff(gc.tz) === tzOff(DEVICE_TZ);
  return `<div class="notice tzwarn"><span>🧭 Your phone is on a different time zone from <b data-notr>${esc(here.name)}</b>, so these are <b data-notr>${esc(here.name)}</b> times. Moved or travelling?</span>
    <div class="btns">${fits ? `<button class="primary" data-act="tzswitch" data-city="${g}">Use ${esc(gc.name)}</button>` : ""}<button class="ghost" data-act="tab" data-tab="settings">Pick my city</button><button class="ghost" data-act="tzok" data-key="${esc(key)}">Keep ${esc(here.name)}</button></div></div>`;
}

/* ---------- views ---------- */
function viewToday(){
  const m = meDoc(), cfg = cfgOf(m), tz = loc(cfg).tz, now = new Date();
  const today = appDay(cfg,now), ds = addDays(today,-S.dayOff), t = times(cfg,ds);
  const isFri = new Date(ds+"T12:00:00Z").getUTCDay() === 5;
  const canLog = !!m && !S.readOnly;
  let html = tzBanner() + requestsNudge() + installNudge() + streakCard() + alertsNudge() + friendsStrip();
  html += `<div class="sechead"><h3>${S.dayOff ? "Yesterday's namaz" : "Today's namaz"}</h3>
    <div class="seg"><button data-act="day" data-d="0" aria-pressed="${!S.dayOff}">Today</button><button data-act="day" data-d="1" aria-pressed="${!!S.dayOff}">Yesterday</button></div></div>${excusedRow(ds)}<div class="list">`;
  for (const p of P){
    const st = t[p.k], end = waqtEnd(cfg,ds,p.k), close = new Date(+st+DAY), code = codeOf(S.myId,ds,p.k);
    const future = now < st, live = now >= st && now < end, locked = now >= close, prayed = code.includes("f"), madeUp = !prayed && code.includes("q");
    const missedWaqt = !prayed && now >= end;   // its time has passed without the fardh logged
    const tag = prayed ? `<span class="tag ok">MashaAllah ✨</span>` : madeUp ? `<span class="tag qz">Made up as qaza 🤲</span>` : future ? `<span class="tag">Upcoming</span>` : live ? `<span class="tag live">Now · ${dur(end-now)} left</span>` : locked ? `<span class="tag">Locked</span>` : `<span class="tag warn">Not logged</span>`;
    const dis = (!canLog || future || locked) ? "disabled" : "";
    html += `<article class="pr ${p.k} ${live?"current":""} ${future?"future":""}">
      <span class="orb ${p.k}" aria-hidden="true"></span>
      <div class="nm"><h3>${isFri && p.k==="dhuhr" ? "Dhuhr / Jumu'ah" : p.en}</h3><span class="bn">${isFri && p.k==="dhuhr" ? "যোহর / জুমা" : p.bn}</span></div>
      <div class="range num"><span>${fmtT(st,tz)} – ${fmtT(end,tz)}</span>${tag}</div>
      <div class="chips"><button class="fard ${prayed?"on":""} ${S.pop===ds+p.k+"f"?"pop":""}" data-act="tog" data-ds="${ds}" data-k="${p.k}" data-c="f" aria-pressed="${prayed}" aria-label="${p.en} fardh, ${p.f} rakat" ${dis}><span class="box" aria-hidden="true">${prayed?`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`:""}</span>${prayed?"Fardh prayed":"Fardh"}<small>${p.f}</small></button>${p.chips.map(([c,l,r])=>`<button class="chip ${code.includes(c)?"on":""}" data-act="tog" data-ds="${ds}" data-k="${p.k}" data-c="${c}" aria-pressed="${code.includes(c)}" ${dis}>${l}<small>${r}</small></button>`).join("")}</div>
      ${canLog && missedWaqt ? `<div class="qzrow"><button class="chip qz ${madeUp?"on":""}" data-act="qtog" data-ds="${ds}" data-k="${p.k}" aria-pressed="${madeUp}">🤲 ${madeUp ? "Prayed as qaza ✓" : "Prayed as qaza"}</button>${madeUp ? "" : `<small>Missed it? Mark it once you make it up.</small>`}</div>` : ""}
      ${isFri && p.k==="dhuhr" && !prayed ? `<p class="note">Prayed Jumu'ah? Tap Fardh, it counts for Dhuhr.</p>` : ""}
      ${p.k==="asr" && live && !prayed && S.dayOff===0 ? (now < new Date(+end - SUNSET_MIN*MIN)
        ? `<p class="note warn">Best before ${fmtT(new Date(+end - SUNSET_MIN*MIN),tz)}. The last ${SUNSET_MIN} minutes before Maghrib are makruh (the sun is setting).</p>`
        : `<p class="note warn">Haven't prayed Asr yet? Pray it now, before Maghrib at ${fmtT(end,tz)}. Delaying this late is disliked, but today's Asr is still valid, and much better than missing it.</p>`) : ""}
      ${!future && !locked && !prayed && !madeUp && !live ? `<p class="note warn">Log by ${fmtShortDT(close,tz)} or it locks and your streak breaks.</p>` : ""}
    </article>`;
  }
  const xc = codeOf(S.myId,ds,"x"), nf = times(cfg,addDays(ds,1)).fajr;
  html += `<article class="pr x"><span class="orb x" aria-hidden="true"></span>
    <div class="nm"><h3>${X.en}</h3><span class="bn">${X.bn}</span></div>
    <div class="range num">Last third of the night from ${fmtT(new Date(+nf-(nf-t.maghrib)/3),tz)}</div>
    <div class="chips">${X.chips.map(([c,l])=>{ const st=chipStart(cfg,ds,"x",c); const off=!canLog||now<st||now>=new Date(+st+DAY); return `<button class="chip ${xc.includes(c)?"on":""}" data-act="tog" data-ds="${ds}" data-k="x" data-c="${c}" aria-pressed="${xc.includes(c)}" ${off?"disabled":""}>${l}</button>`; }).join("")}</div></article>`;
  html += `</div><p class="note foot">Each namaz can be logged for 24 hours after its waqt begins. Only fardh counts toward your streak.</p>` + watermark();
  return html;
}
function excusedRow(ds){
  if (!meDoc()) return "";
  const on = S.excused.has(ds), sure = S.confirmEx === ds;
  if (on) return `<div class="exrow on"><span>⏸ <b>Excused${S.dayOff?" yesterday":" today"}.</b> Your streak is paused, not broken. Only you can see this.</span><button class="ghost" data-act="excuse" data-ds="${ds}">Undo</button></div>`;
  return `<div class="exrow"><button class="exbtn ${sure?"sure":""}" data-act="excuse" data-ds="${ds}">${sure ? "Pause streak for this day? Tap again" : `⏸ Can't pray ${S.dayOff?"yesterday":"today"}? Excuse this day`}</button></div>`;
}
function viewBoard(){
  const g = curGroup();
  const chips = `<div class="gchips"><button class="gchip" data-act="gpick" data-id="all" aria-pressed="${S.gid==="all"}">🌍 Everyone</button>${S.groups.map(x => `<button class="gchip" data-act="gpick" data-id="${x.id}" aria-pressed="${g&&x.id===g.id}">${esc(x.name)}</button>`).join("")}
    <button class="gchip add" data-act="gnew">＋ New group</button><button class="gchip add" data-act="gjoin">＋ Join a group</button></div>`;
  if (S.gform) return chips + groupForm();
  if (S.gid==="all") return chips + everyoneBoard();
  if (!g) return chips + `<div class="panel empty"><h3>Your namaz is private 🔒</h3><p>Nobody can see your log until you're in a group. Create one and share its link, or join a friend's group with their code.</p>
    <div class="btns" style="justify-content:center"><button class="primary" data-act="gnew">Create a group</button><button class="ghost" data-act="gjoin">Join with code</button></div></div>`;
  const ids = groupIds(g.id), isOwner = g.owner===S.myId;
  const link = `${location.origin}${location.pathname}?g=${g.code}`;
  let html = chips + `<section class="ghead"><div><h3 data-notr>${esc(g.name)}</h3><p>${ids.length} member${ids.length===1?"":"s"} · 🔥 Streaks & rings</p><button class="gcode" data-act="gcopy" data-link="${esc(link)}" data-code="${g.code}" title="Copy invite link">Code <b data-notr>${g.code}</b> ⧉</button></div>
    <div class="btns"><button class="ghost" data-act="ginvite" data-link="${esc(link)}" data-code="${g.code}">Invite</button><button class="ghost" data-act="gmanage">${isOwner?"Manage":"Info"}</button></div></section>`;
  if (S.gmanage) html += manageGroup(g);
  const sq = groupStreak(g.id);
  if (sq !== null) html += `<section class="squad"><div class="flame ${sq?"lit":""}">${flameSvg(true)}<span class="n num">${sq}</span></div>
    <div><h3>Group streak · ${sq} day${sq===1?"":"s"}</h3><p>${sq ? "As long as the shortest streak in the group. Keep each other going!" : "Starts when everyone has a streak going."}</p></div></section>`;
  return html + ringStrip(ids, "Today in " + esc(g.name), g.id) + nudgeFeed(g.id) + leaderboard(ids, true);
}
function everyoneBoard(){
  const ids = pubIds();
  const note = isPub(S.myId) ? "" : `<div class="notice"><span>🔒 <b>You're private</b>, so you're hidden from this board. Your groups still see your record.</span><button class="ghost" data-act="vis">Go public</button></div>`;
  let html = note + `<section class="ghead"><div><h3>🌍 Everyone</h3><p>${ids.length} public member${ids.length===1?"":"s"} · 🔥 Streaks and today's rings</p></div></section>`;
  if (!ids.length) return html + `<div class="panel empty">Nobody is public yet.</div>`;
  return html + leaderboard(ids, false);
}
function leaderboard(ids, full){
  const rows = ids.map(id => ({id, m:S.members[id], s:summaryFor(id,S.period)}));
  rows.sort((a,b)=> (b.s.pct??-1)-(a.s.pct??-1) || b.s.streak-a.s.streak || b.s.done-a.s.done);
  let html = `<div class="sechead"><h3>${S.period==="7"?"Last 7 days":S.period==="all"?"Since joining":"This month"}</h3>
    <div class="seg"><button data-act="period" data-p="7" aria-pressed="${S.period==="7"}">7 days</button><button data-act="period" data-p="month" aria-pressed="${S.period==="month"}">Month</button><button data-act="period" data-p="all" aria-pressed="${S.period==="all"}">All</button></div></div>`;
  if (rows.length >= 3){
    const order = [rows[1],rows[0],rows[2]], cls = ["p2","p1","p3"], place = ["2nd","1st","3rd"];
    html += `<div class="podium">${order.map((r,i)=>`<div class="pod ${cls[i]}">${avatar(r.id,r.m.name,i===1)}<span class="nm">${esc(r.m.name||"Someone")}</span>
      <div class="blk"><span class="g">${grade(r.s.pct)}</span>${bestBadge(r.id)}<span class="pl">${place[i]}</span></div></div>`).join("")}</div>`;
  }
  html += `<div class="list">`;
  rows.forEach((r,i) => {
    const showX = r.id===S.myId || (full && r.m.showExtras !== false), low = r.s.pct!=null && r.s.pct<70;
    const canDetail = r.id===S.myId || full;
    html += `<div class="person"><button data-act="open" data-id="${esc(r.id)}" aria-expanded="${S.open===r.id}">
      <span class="rank">${i+1}</span>${avatar(r.id,r.m.name)}
      <span style="min-width:0"><span class="pname">${esc(r.m.name||"Someone")}${r.id===S.myId?'<span class="you">you</span>':""}${bestBadge(r.id)}${badgeChip(r.id)}</span>
        <span class="bar"><i style="width:${r.s.pct??0}%"></i></span>
        <span class="pstats num"><span>${r.s.done}/${r.s.due} fardh</span>${showX && !(r.s.ptsMonthOnly) && S.period!=="all" ?`<span>${r.s.pts} pts</span>`:""}${r.s.dots?`<span class="dots" title="Today's fardh">${r.s.dots.map(d=>`<i class="${d}"></i>`).join("")}</span>`:""}</span></span>
      <span class="grade ${low?"low":""}">${grade(r.s.pct)}</span></button>
      ${S.open===r.id ? `<div class="detail">${canDetail ? gradesheet(r.id) : `<p class="note">Only streaks and grades are shared here, so daily details stay private.</p>`}</div>` : ""}</div>`;
  });
  return html + `</div><p class="note foot">Ranked by fardh prayed out of fardh due. Excused days never count against anyone, and nobody can see them.</p>`;
}
function previewHtml(){
  const pv = S.preview;
  if (!pv) return "";
  if (pv.loading) return `<p class="note">Looking up the group…</p>`;
  if (!pv.name) return `<p class="note">No group has that code. Check it with your friend.</p>`;
  return `<div class="gprev"><span class="gpi">👥</span><div><b data-notr>${esc(pv.name)}</b><small>${pv.members} member${pv.members===1?"":"s"} · 🔥 Streaks & rings</small></div></div>`;
}
async function lookupGroup(code){
  code = String(code||"").trim().toUpperCase();
  if (code.length < 6){ S.preview = null; return; }
  S.preview = {loading:true, code};
  const {data, error} = await S.sb.rpc("group_preview",{join_code:code});
  if (S.preview?.code !== code) return;   // they typed something else meanwhile
  const r = !error && data?.[0];
  S.preview = r ? {code, name:r.name, members:r.members, mode:r.mode} : {code, name:null, missing:!!error && /function|schema/i.test(error.message||"")};
  if (S.preview.missing) S.preview = {code, name:code, members:0, mode:""};  // database not updated yet: still allow joining
}
function refreshPreview(){
  const el = $("gPreview"), btn = $("gJoinBtn"); if (!el) return;
  el.innerHTML = previewHtml();
  btn.disabled = !S.preview?.name; btn.textContent = S.preview?.name ? `Join ${S.preview.name}` : "Join";
}
function groupForm(){
  if (S.gform==="join") return `<form class="panel" id="gJoinForm"><h3>Join a group</h3><p>Ask a friend for their group's 6-letter code, or open the invite link they sent.</p>
    <label class="f">Group code<input id="g-code" maxlength="6" required autocomplete="off" placeholder="e.g. K7Q2ZP" value="${esc(S.joinCode||"")}" style="text-transform:uppercase;letter-spacing:.2em"></label>
    <div id="gPreview">${previewHtml()}</div>
    <div class="btns"><button class="primary" type="submit" id="gJoinBtn" ${S.preview?.name?"":"disabled"}>${S.preview?.name ? `Join ${esc(S.preview.name)}` : "Join"}</button><button class="ghost" type="button" data-act="gcancel">Cancel</button></div></form>`;
  return `<form class="panel" id="gNewForm"><h3>New group 🌸</h3>
    <label class="f">Name<input id="g-name" maxlength="30" required placeholder="Uni friends, Family, Cousins…"></label>
    <p class="note">Everyone in the group sees each other's 🔥 streak and today's fardh rings.</p>
    <div class="btns"><button class="primary" type="submit">Create</button><button class="ghost" type="button" data-act="gcancel">Cancel</button></div></form>`;
}
function manageGroup(g){
  const isOwner = g.owner===S.myId, ids = groupIds(g.id);
  if (!isOwner) return `<section class="panel"><p>Created by ${esc(S.members[g.owner]?.name || "someone")}. Members see each other's 🔥 streak and today's fardh rings.</p>
    <div class="btns"><button class="ghost danger ${S.confirmLeave===g.id?"sure":""}" data-act="gleave" data-id="${g.id}">${S.confirmLeave===g.id?"Tap again to leave":"Leave group"}</button></div></section>`;
  return `<form class="panel" id="gEditForm" data-id="${g.id}"><h3>Manage group</h3>
    <label class="f">Name<input id="ge-name" maxlength="30" required value="${esc(g.name)}"></label>
    <div class="btns"><button class="primary" type="submit">Save</button></div>
    <div class="label">Members</div>
    <div class="mlist">${ids.map(id => `<div class="mrow">${avatar(id,S.members[id].name)}<span class="n">${esc(S.members[id].name||"Someone")}${id===S.myId?" (you)":""}</span>${id===S.myId?"":`<button type="button" data-act="gkick" data-id="${id}" class="${S.confirmKick===id?"sure":""}">${S.confirmKick===id?"Tap to confirm":"Remove"}</button>`}</div>`).join("")}</div>
    <div class="btns"><button type="button" class="ghost danger ${S.confirmDel===g.id?"sure":""}" data-act="gdelete" data-id="${g.id}">${S.confirmDel===g.id?"Tap again to delete the group":"Delete group"}</button></div></form>`;
}
function gradesheet(id){
  const m = S.members[id], cfg = cfgOf(m), now = new Date(), today = appDay(cfg,now);
  let start = today.slice(0,8)+"01"; if (m?.joined && m.joined > start) start = m.joined;
  const showX = m.showExtras !== false || id===S.myId;
  const per = P.map(p => ({p, due:0, done:0, s:0, q:0})); let tah=0, nights=0;
  for (let d=start; d<=today; d=addDays(d,1)){
    const t = times(cfg,d);
    const ex = id===S.myId && S.excused.has(d);
    per.forEach(o => { if (t[o.p.k] <= now){ const c=codeOf(id,d,o.p.k), f=c.includes("f"); if (f || (!ex && !preJoin(m,d,t[o.p.k]))) o.due++; if (f) o.done++; else if (c.includes("q")) o.q++; if (c.includes("s") || c.includes("b")) o.s++; } });
    nights++; if (codeOf(id,d,"x").includes("t")) tah++;
  }
  const month = new Date(today+"T12:00:00Z").toLocaleDateString("en-GB",{month:"long",timeZone:"UTC"});
  let h = `<div class="label">${month} gradesheet</div><table class="gs num"><thead><tr><th>Waqt</th><th>Fardh</th>${showX?"<th>Sunnah</th>":""}<th>Grade</th></tr></thead><tbody>`;
  per.forEach(o => { const pct = o.due ? o.done/o.due*100 : null;
    h += `<tr><td>${o.p.en}<span class="bn">${o.p.bn}</span></td><td>${o.done}/${o.due}${o.q ? ` <span class="qtag" title="Made up as qaza">+${o.q} qaza</span>` : ""}</td>${showX?`<td>${o.s}/${o.due}</td>`:""}<td class="g">${grade(pct)}</td></tr>`; });
  h += `</tbody></table>`;
  if (showX) h += `<p class="note">Tahajjud on ${tah} of ${nights} nights this month.</p>`;
  return h + `<div class="label">Last 12 weeks</div>` + heatmap(id);
}
function heatmap(id){
  const m = S.members[id], cfg = cfgOf(m), now = new Date(), today = appDay(cfg,now);
  const dow = new Date(today+"T12:00:00Z").getUTCDay(), end = addDays(today, 6-dow), start = addDays(end, -83);
  let cells = "";
  for (let d=start; d<=end; d=addDays(d,1)){
    if (d > today || (m?.joined && d < m.joined)){ cells += `<i class="${d>today?"x":""}"></i>`; continue; }
    const n = P.filter(p => codeOf(id,d,p.k).includes("f")).length;
    if (id===S.myId && S.excused.has(d) && n<5){ cells += `<i class="ex" title="${fmtDay(d)}: excused (only you see this)"></i>`; continue; }
    cells += `<i class="${n?"h"+n:""}" title="${fmtDay(d)}: ${n}/5 fardh"></i>`;
  }
  return `<div class="heat" role="img" aria-label="Daily fardh count, last 12 weeks">${cells}</div>
    <div class="legend">0 <i style="background:var(--off)"></i><i style="background:color-mix(in srgb,var(--accent) 20%,var(--off))"></i><i style="background:color-mix(in srgb,var(--accent) 54%,var(--off))"></i><i style="background:var(--accent)"></i> 5 fardh</div>`;
}
function viewMe(){
  const m = meDoc();
  const s7 = memberSummary(S.myId,"7"), sm = memberSummary(S.myId,"month"), best = bestStreak(S.myId);
  return streakCard() + `<div class="panel"><div class="brand">${avatar(S.myId,m.name)}<div><h3>${esc(m.name)}</h3><p class="note">${esc(loc(cfgOf(m)).name)} · ${cfgOf(m).madhab==="hanafi"?"Hanafi Asr":"Standard Asr"}</p></div><span class="grade" style="margin-left:auto">${grade(sm.pct)}</span></div>
    <div class="tiles num"><div class="tile"><b>${s7.pct==null?"–":Math.round(s7.pct)+"%"}</b><span>Fardh, 7 days</span></div><div class="tile"><b>${best}</b><span>Best streak</span></div><div class="tile"><b>${sm.pts}</b><span>Points this month</span></div></div>
    ${gradesheet(S.myId)}</div>` + weekCard() + badgeShelf(best) + qazaPanel();
}

/* ---------- weekly recap ---------- */
function weekData(){
  const m = meDoc(), cfg = cfgOf(m), now = new Date(), today = appDay(cfg, now);
  const days = []; let total = 0, done = 0, qaza = 0;
  for (let i=6; i>=0; i--){
    const ds = addDays(today, -i), t = times(cfg, ds), before = m.joined && ds < m.joined;
    const ex = S.excused.has(ds) && !P.every(p => codeOf(S.myId,ds,p.k).includes("f"));
    const dots = P.map(p => {
      const c = codeOf(S.myId,ds,p.k);
      if (before || ex || (!c.includes("f") && preJoin(m,ds,t[p.k]))) return "n";   // not counted
      total++;
      if (c.includes("f")){ done++; return "d"; }
      if (c.includes("q")){ qaza++; return "q"; }
      return t[p.k] > now ? "u" : "m";   // upcoming or missed
    });
    days.push({ds, label:new Date(ds+"T12:00:00Z").toLocaleDateString("en-GB",{weekday:"short",timeZone:"UTC"}).slice(0,2), dots});
  }
  const joinedMid = m.joined && m.joined > days[0].ds ? m.joined : null;
  return {days, done, total, qaza, streak:streakFor(S.myId, now), from:joinedMid || days[0].ds, to:days[6].ds, joinedMid, name:m.name || ""};
}
function weekCard(){
  const w = weekData();
  return `<section class="panel week"><div class="sechead"><h3>📊 This week</h3><p class="num">${w.done}/${w.total} fardh${w.joinedMid ? " · since you joined" : ""}</p></div>
    <div class="wgrid">${w.days.map(d => `<div class="wcol"><div class="wdots">${d.dots.map(x=>`<i class="${x}"></i>`).join("")}</div><small>${d.label}</small></div>`).join("")}</div>
    <div class="btns"><button class="primary" data-act="recap">📸 Share my week</button></div></section>`;
}
async function drawWeekCard(w){
  try { await document.fonts.ready; } catch {}
  const bn = LANG === "bn", c = document.createElement("canvas"); c.width = 1080; c.height = 1920;
  const g = c.getContext("2d"), F = (sz, wt=800) => `${wt} ${sz}px "Baloo Da 2", Nunito, system-ui, sans-serif`, N = n => bn ? toBn(n) : String(n);
  // dreamy background
  const bg = g.createLinearGradient(0,0,0,1920); bg.addColorStop(0,"#FFE0EC"); bg.addColorStop(.5,"#F3E6FF"); bg.addColorStop(1,"#D9C8FF");
  g.fillStyle = bg; g.fillRect(0,0,1080,1920);
  const blob = (x,y,r,col) => { const rg = g.createRadialGradient(x,y,0,x,y,r); rg.addColorStop(0,col); rg.addColorStop(1,"rgba(255,255,255,0)"); g.fillStyle = rg; g.beginPath(); g.arc(x,y,r,0,7); g.fill(); };
  blob(160,260,320,"rgba(255,170,200,.55)"); blob(950,1650,380,"rgba(185,160,255,.5)"); blob(980,420,220,"rgba(255,230,160,.45)");
  const star = (x,y,r,col) => { g.fillStyle = col; g.beginPath(); for (let i=0;i<8;i++){ const a = i*Math.PI/4, rr = i%2 ? r*.38 : r; g.lineTo(x+Math.cos(a)*rr, y+Math.sin(a)*rr); } g.closePath(); g.fill(); };
  for (const [x,y,r] of [[120,150,26],[960,170,34],[90,820,18],[1000,760,22],[140,1560,24],[930,1290,16],[540,105,14]]) star(x,y,r,"rgba(255,255,255,.9)");
  const heart = (x,y,s,fill,stroke) => { g.beginPath(); g.moveTo(x, y+s*.35);
    g.bezierCurveTo(x-s*1.05, y-s*.35, x-s*.45, y-s*1.05, x, y-s*.42); g.bezierCurveTo(x+s*.45, y-s*1.05, x+s*1.05, y-s*.35, x, y+s*.35);
    g.closePath(); if (fill){ g.fillStyle = fill; g.fill(); } if (stroke){ g.lineWidth = 6; g.strokeStyle = stroke; g.stroke(); } };
  // moon badge
  g.fillStyle = "#fff"; g.beginPath(); g.arc(540,190,70,0,7); g.fill();
  g.font = F(80); g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("🌙", 540, 196); g.textBaseline = "alphabetic";
  g.fillStyle = "#4A3A5E"; g.font = F(76); g.fillText(bn ? "আমার নামাজের সপ্তাহ" : "my namaz week", 540, 365);
  const fmt = ds => new Date(ds+"T12:00:00Z").toLocaleDateString(bn?"bn-BD":"en-GB",{day:"numeric",month:"short",timeZone:"UTC"});
  g.font = F(38,700); g.fillStyle = "#9A87AE"; g.fillText((w.joinedMid ? (bn ? "যোগ দেওয়ার পর থেকে · " : "since I joined · ") : "") + `${fmt(w.from)} – ${fmt(w.to)}`, 540, 425);
  // big score sticker
  g.save(); g.translate(540, 660); g.rotate(-0.03);
  g.fillStyle = "rgba(255,255,255,.92)"; roundRect(g, -380, -175, 760, 350, 90); g.fill();
  g.lineWidth = 8; g.setLineDash([22,16]); g.strokeStyle = "#FFB3C7"; roundRect(g, -352, -147, 704, 294, 70); g.stroke(); g.setLineDash([]);
  const pct = w.total ? w.done / w.total : 0;
  g.fillStyle = "#E0336F"; g.font = F(200); g.fillText(`${N(w.done)}/${N(w.total)}`, 0, 50);
  g.fillStyle = "#4A3A5E"; g.font = F(46,800); g.fillText(bn ? "ফরজ পড়েছি ✨" : "fardh prayed ✨", 0, 125);
  g.restore();
  // hearts grid
  const x0 = 192, gap = 116, y0 = 935, rowGap = 92;
  w.days.forEach((d,i) => { const x = x0 + i*gap;
    d.dots.forEach((st,j) => { const y = y0 + j*rowGap;
      if (st==="d") heart(x, y, 34, "#FF6F9E");
      else if (st==="q") heart(x, y, 34, "#B9A6F5");
      else if (st==="m") heart(x, y, 30, null, "#FFB3C7");
      else { g.fillStyle = "rgba(255,255,255,.75)"; g.beginPath(); g.arc(x, y-4, 11, 0, 7); g.fill(); } });
    g.fillStyle = "#9A87AE"; g.font = F(34,800);
    g.fillText(bn ? new Date(d.ds+"T12:00:00Z").toLocaleDateString("bn-BD",{weekday:"narrow",timeZone:"UTC"}) : d.label, x, y0 + 5*rowGap - 10); });
  // legend
  g.font = F(30,700); g.fillStyle = "#9A87AE"; g.textAlign = "left";
  const leg = [["#FF6F9E", bn ? "সময়মতো" : "on time"], ...(w.qaza ? [["#B9A6F5", bn ? "কাজা" : "qaza"]] : [])];
  let lx = 540 - (leg.length * 220) / 2 + 40;
  for (const [col, txt] of leg){ heart(lx, 1430, 18, col); g.fillStyle = "#9A87AE"; g.fillText(txt, lx + 30, 1442); lx += 220; }
  g.textAlign = "center";
  // streak pill
  const pillTxt = w.streak ? (bn ? `🔥 ${toBn(w.streak)} দিনের স্ট্রিক` : `🔥 ${w.streak}-day streak`) : (bn ? "🌱 নতুন স্ট্রিক আসছে" : "🌱 new streak loading");
  g.font = F(58); const pw = g.measureText(pillTxt).width + 110;
  g.fillStyle = "#fff"; roundRect(g, 540 - pw/2, 1500, pw, 110, 55); g.fill();
  g.fillStyle = "#4A3A5E"; g.fillText(pillTxt, 540, 1575);
  const vibe = pct === 1 ? (bn ? "একটাও বাদ যায়নি, আলহামদুলিল্লাহ 🤍" : "didn't miss a single one, alhamdulillah 🤍")
    : pct >= .8 ? (bn ? "আলহামদুলিল্লাহ, এক ওয়াক্ত করে 🌸" : "alhamdulillah, one namaz at a time 🌸")
    : (bn ? "ছোট ছোট পদক্ষেপ, প্রতিদিন 🌱" : "small steps, every single day 🌱");
  g.font = F(38,700); g.fillStyle = "#8E78A8"; g.fillText(vibe, 540, 1690);
  g.font = F(38); g.fillStyle = "#4A3A5E"; g.fillText("Namaz Board", 540, 1830);
  return c;
}
const toBn = n => String(n).replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[d]);
function roundRect(g,x,y,w,h,r){ g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }
async function openRecap(){
  if (!meDoc()) return;
  const canvas = await drawWeekCard(weekData());
  const blob = await new Promise(r => canvas.toBlob(r, "image/png")); S.recapBlob = blob;
  let el = $("recapDlg"); if (!el){ el = document.createElement("div"); el.id = "recapDlg"; el.className = "tour"; el.setAttribute("role","dialog"); el.setAttribute("aria-modal","true"); document.body.appendChild(el); }
  if (S.recapUrl) URL.revokeObjectURL(S.recapUrl); S.recapUrl = URL.createObjectURL(blob);
  el.innerHTML = `<div class="tcard recap"><img src="${S.recapUrl}" alt="Your namaz week card"><div class="btns"><button class="primary" data-act="recapshare">Share 📸</button><button class="ghost" data-act="recapclose">Close</button></div></div>`;
}
function badgeShelf(best){
  return `<section class="panel"><h3>Badges</h3><p>Earned by praying all 5 fardh for days in a row. Your best streak: <b>${best}</b>.</p>
    <div class="shelf">${MILESTONES.map(x => `<div class="sbadge ${best>=x.n?"on":""}"><span>${x.e}</span><b>${x.t}</b><small>${best>=x.n ? "Earned" : `${x.n - best} to go`}</small></div>`).join("")}</div></section>`;
}
const QAZA_W = [["fajr","Fajr"],["dhuhr","Dhuhr"],["asr","Asr"],["maghrib","Maghrib"],["isha","Isha"],["witr","Witr"]];
/* Fardh missed since joining (locked, not prayed, not made up as qaza, not on an excused day). */
function autoMissed(){
  const m = meDoc(), out = {}; if (!m?.joined) return out;
  const cfg = cfgOf(m), now = new Date(), today = appDay(cfg, now);
  for (let d = m.joined, i = 0; d <= today && i < 4000; d = addDays(d,1), i++){
    if (S.excused.has(d) && !P.every(p => codeOf(S.myId,d,p.k).includes("f"))) continue;
    const t = times(cfg, d);
    for (const p of P){
      const c = codeOf(S.myId,d,p.k);
      if (c.includes("f") || c.includes("q") || preJoin(m,d,t[p.k]) || now < new Date(+t[p.k]+DAY)) continue;
      out[p.k] = (out[p.k]||0) + 1;
    }
  }
  return out;
}
function qazaPanel(){
  if (!S.qazaReady) return "";
  const auto = autoMissed();
  let owedAll = 0, doneAll = 0;
  const rows = QAZA_W.map(([k,l]) => { const q = S.qaza[k] || {owed:0, done:0}, a = auto[k] || 0, total = q.owed + a, done = Math.min(total, q.done), left = total - done;
    owedAll += total; doneAll += done;
    return `<div class="qrow"><b>${l}</b>
      <label class="qown">Before the app<input type="number" min="0" max="100000" inputmode="numeric" data-qown="${k}" value="${q.owed}"></label>
      <span class="qleft num">${left ? `${left} left` : total ? "All made up ✨" : "–"}${a ? `<small>+${a} missed in the app</small>` : ""}</span>
      <button class="ghost" data-act="qdone" data-k="${k}" ${left?"":"disabled"}>✓ Made one up</button></div>`; }).join("");
  return `<section class="panel" id="qaza"><h3>Qaza 🔒</h3><p>Keep count of missed prayers you're making up. Only you can see this list.</p>
    ${owedAll ? `<div class="bar"><i style="width:${(doneAll/owedAll*100).toFixed(1)}%"></i></div><p class="note num">${doneAll} of ${owedAll} made up</p>` : ""}
    <div class="qlist">${rows}</div>
    <p class="note">Fardh you miss in the app are added here by themselves. Type any you owe from <b>before the app</b>, then tap <b>Made one up</b> each time you pray one. For a missed fardh from today or yesterday, you can also tap <b>🤲 Prayed as qaza</b> on that namaz.</p></section>`;
}
async function saveQaza(k, patch){
  const q = {...(S.qaza[k] || {owed:0, done:0}), ...patch}, a = autoMissed()[k] || 0;
  q.owed = Math.max(0, Math.min(100000, q.owed|0)); q.done = Math.max(0, Math.min(q.owed + a, q.done|0));
  const {error} = await S.sb.from("qaza").upsert({user_id:S.myId, waqt:k, owed:q.owed, done:q.done, updated_at:new Date().toISOString()}, {onConflict:"user_id,waqt"});
  if (error){ toast("Couldn't save that."); return false; }
  S.qaza[k] = q; return true;
}
function cityOptions(cfg){
  const groups = {};
  for (const [k,c] of Object.entries(CITIES)) (groups[c.group] ||= []).push([k,c]);
  const custom = cfg.city==="custom" || S.geo ? `<option value="custom" selected>📍 ${esc((S.geo||cfg).place || "My location")}</option>` : "";
  // Bangladesh and the UK first, then countries A–Z; cities A–Z inside each.
  const rank = g => g==="Bangladesh" ? "0" : g==="United Kingdom" ? "1" : "2"+g;
  const sorted = Object.entries(groups).sort((a,b) => rank(a[0]).localeCompare(rank(b[0]))).map(([g,list]) => [g, list.sort((x,y) => x[1].name.localeCompare(y[1].name))]);
  return custom + sorted.map(([g,list]) => `<optgroup label="${esc(g)}">${list.map(([k,c])=>`<option value="${k}" ${!S.geo && k===cfg.city?"selected":""}>${esc(c.name)}</option>`).join("")}</optgroup>`).join("");
}
function viewSettings(){
  const m = meDoc() || {}, cfg = cfgOf(m), isNew = !meDoc();
  const guessName = S.myRequest?.name || S.session?.user?.user_metadata?.given_name || (S.session?.user?.user_metadata?.full_name||"").split(" ")[0] || "";
  const reqTop = S.admin && S.requests.length ? adminPanel().split('<section class="panel" id="manage">')[0] : "";
  return reqTop + `<form class="panel" id="setupForm"><h3>${isNew?"Join the board 🌸":"Your settings"}</h3>
    <p>Namaz times are worked out for your own city, so each person can be somewhere different.</p>
    <label class="f">Name on the board<input id="f-name" maxlength="24" required value="${esc(m.name||guessName)}" placeholder="e.g. Shupti"></label>
    <div class="grid2">
      <label class="f">City<select id="f-city">${cityOptions(cfg)}</select></label>
      <label class="f">Asr time<select id="f-madhab"><option value="hanafi" ${cfg.madhab==="hanafi"?"selected":""}>Hanafi (later)</option><option value="shafi" ${cfg.madhab==="shafi"?"selected":""}>Standard (earlier)</option></select></label>
    </div>
    <label class="f">Fajr & Isha method<select id="f-method">${Object.entries(METHODS).map(([k,l])=>`<option value="${k}" ${k===cfg.method?"selected":""}>${l}</option>`).join("")}</select></label>
    <div class="locrow"><button type="button" class="ghost" data-act="geo">📍 Use my location</button><span class="note" id="geoNote">${cfg.city==="custom" ? `Using ${esc(cfg.place)} (rounded to about 10 km).` : "Optional. Exact times for where you are. Your position is rounded to about 10 km."}</span></div>
    <p class="note">Picking a city also picks the usual method there. You can still change it. <b>City not listed?</b> Tap <b>📍 Use my location</b> above for exact times wherever you are.</p>
    <fieldset class="vis"><legend>Everyone board</legend>
      <label><input type="radio" name="f-vis" id="f-public" value="public" ${m.isPublic!==false?"checked":""}><span><b>🌍 Public</b><small>I'm on the Everyone board: all Namaz Board users see my streak, grade and today's fardh. My groups see me too.</small></span></label>
      <label><input type="radio" name="f-vis" id="f-private" value="private" ${m.isPublic===false?"checked":""}><span><b>🔒 Private</b><small>I'm hidden from the Everyone board. My groups still see my record.</small></span></label>
    </fieldset>
    <label class="check" id="extrasRow"><input type="checkbox" id="f-extras" ${m.showExtras!==false?"checked":""}> Show my sunnah, nafl and tahajjud to my groups</label>
    <div class="btns"><button class="primary" type="submit">${isNew?"Join":"Save"}</button>${isNew?"":`<button class="ghost" type="button" data-act="tab" data-tab="today">Cancel</button>`}</div>
  </form>
  ${S.admin && !S.requests.length ? adminPanel() : S.admin ? adminPanel().replace(/^[\s\S]*?(<section class="panel" id="manage">)/,"$1") : ""}
  <div class="panel"><h3>Language</h3>${langPicker()}<p class="note">Alerts on your phone follow this too.</p></div>
  ${isCodeEmail(S.email) ? (savedCode() ? codeCard(savedCode(), false) : `<section class="panel codecard"><h3>🔑 Your Namaz Board code</h3><p>This browser doesn't have your code saved. Make a new one so you can always get back in. Your old code will stop working.</p></section>`)
    + `<div class="btns" style="margin:-6px 0 14px"><button class="ghost" type="button" data-act="newcode">${S.confirmNewCode ? "Tap again: old code stops working" : "Make a new code"}</button></div>` : ""}
  <div class="panel"><div class="btns"><button class="ghost" type="button" data-act="tour">✨ How Namaz Board works</button><a class="ghost" href="privacy.html" target="_blank" rel="noopener">Privacy</a></div><p class="note">Signed in as ${esc(emailLabel(S.email))}</p><div class="btns"><button class="ghost" type="button" data-act="signout">Sign out</button>${meDoc() ? `<button class="ghost danger ${S.confirmDelMe?"sure":""}" type="button" data-act="deleteme">${S.confirmDelMe?"Tap again: delete everything":"Delete my account"}</button>` : ""}</div></div>${watermark()}`;
}
function requestsNudge(){
  if (!S.admin || !S.requests.length) return "";
  const n = S.requests.length;
  return `<div class="notice req"><span>💌 <b>${n} ${n===1?"person wants":"people want"} to join</b> · ${esc(S.requests.slice(0,3).map(r=>r.name).join(", "))}</span><button class="primary" data-act="settings">Review</button></div>`;
}
const ago = iso => { const m = Math.round((Date.now()-new Date(iso))/60000); return m<60 ? `${Math.max(1,m)} min ago` : m<1440 ? `${Math.round(m/60)} h ago` : `${Math.round(m/1440)} d ago`; };
function adminPanel(){
  const ids = Object.keys(S.members);
  const reqs = S.requests.length ? S.requests.map(r => `<div class="reqrow"><div class="who"><b>${esc(r.name)}</b><small>${esc(emailLabel(r.email))} · ${ago(r.created_at)}</small>${r.note?`<p>“${esc(r.note)}”</p>`:""}</div>
      <div class="btns"><button type="button" class="primary" data-act="approve" data-id="${esc(r.user_id)}">Approve</button><button type="button" class="ghost" data-act="decline" data-id="${esc(r.user_id)}">Decline</button></div></div>`).join("")
    : `<p class="note">No requests right now. When someone signs in and asks to join, they'll appear here and you'll get a notification.</p>`;
  return requestsPanel(reqs) + managePanel(ids);
}
function requestsPanel(reqs){
  return `<section class="panel" id="requests"><h3>Join requests 💌${S.requests.length?` <span class="count-badge">${S.requests.length}</span>`:""}</h3>
    <p>Share the app link. People sign in with Google and ask to join. You approve them here.</p>
    <div class="mlist">${reqs}</div></section>`;
}
function managePanel(ids){
  return `<section class="panel" id="manage"><h3>Or invite directly</h3><p>Add a Gmail address and that person can join straight away, without asking.</p>
    <form class="invite" id="inviteForm"><input id="f-invite" type="email" required placeholder="friend@gmail.com" autocomplete="off"><button class="primary" type="submit">Invite</button></form>
    <div class="mlist">${S.invites.map(e => `<div class="mrow"><span class="n">${esc(emailLabel(e))}</span><button type="button" data-act="uninvite" data-e="${esc(e)}">Remove</button></div>`).join("") || `<p class="note">No invites yet.</p>`}</div>
    <h3 style="margin-top:6px">Members</h3><p>Removing someone deletes their log for good.</p>
    <div class="mlist">${ids.map(id => `<div class="mrow">${avatar(id,S.members[id].name)}<span class="n">${esc(S.members[id].name||"Someone")}${id===S.myId?" (you)":""}</span>
      ${id===S.myId ? "" : `<button type="button" data-act="rm" data-id="${esc(id)}" class="${S.confirmRm===id?"sure":""}">${S.confirmRm===id?"Tap to confirm":"Remove"}</button>`}</div>`).join("")}</div></section>`;
}

/* ---------- notifications ---------- */
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform==="MacIntel" && navigator.maxTouchPoints>1);
const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const pushSupported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
S.pushOn = false;
async function checkPush(){
  if (!pushSupported || !S.swReg) return;
  try { const sub = await S.swReg.pushManager.getSubscription(); S.pushOn = !!sub && Notification.permission === "granted"; if (sub && S.myId) saveSub(sub); } catch {}
}
async function saveSub(sub){
  const j = sub.toJSON();
  await S.sb.from("push_subscriptions").upsert({endpoint:j.endpoint, user_id:S.myId, p256dh:j.keys.p256dh, auth:j.keys.auth},{onConflict:"endpoint"});
}
function b64ToBytes(b64){ const p="=".repeat((4-b64.length%4)%4); const s=atob((b64+p).replace(/-/g,"+").replace(/_/g,"/")); return Uint8Array.from(s,c=>c.charCodeAt(0)); }
async function enablePush(){
  if (!S.swReg){ toast("The app is still starting. Try again in a moment."); return; }
  const perm = await Notification.requestPermission();
  if (perm !== "granted"){ toast("Notifications are blocked. Allow them in your phone's settings for this app."); render(); return; }
  try {
    const sub = (await S.swReg.pushManager.getSubscription()) || await S.swReg.pushManager.subscribe({userVisibleOnly:true, applicationServerKey:b64ToBytes(CONF.vapidPublicKey)});
    await saveSub(sub); S.pushOn = true; toast("Alerts on 🔔 You'll get a notification for each namaz.");
  } catch(e){ toast("Couldn't turn on alerts: " + (e?.message || "unknown error")); }
  render();
}
async function disablePush(){
  try { const sub = await S.swReg?.pushManager.getSubscription(); if (sub){ await S.sb.from("push_subscriptions").delete().eq("endpoint", sub.endpoint); await sub.unsubscribe(); } } catch {}
  S.pushOn = false; toast("Alerts off on this phone"); render();
}
async function testPush(){
  try {
    const {data, error} = await S.sb.functions.invoke("notify",{body:{test:true}});
    if (!error){ toast(data?.sent ? "Test sent. It should arrive in a few seconds." : "The function ran but found no alert subscription for you. Tap Turn off, then turn alerts on again."); return; }
    let why = error.message || "unknown error";
    try { const r = error.context; if (r){ const t = await r.text(); why = `HTTP ${r.status}: ${t.slice(0,160)}`; } } catch {}
    if (/Failed to send a request|FunctionsFetchError/i.test(why) || /404/.test(why)) why += " (is a function named 'notify' deployed?)";
    toast("Test failed · " + why);
  } catch(e){ toast("Test failed · " + (e?.message || "check your connection")); }
}
/* Android/desktop Chrome: offer a real install (no Chrome badge on the icon). */
let installEvt = null;
addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEvt = e; scheduleRender(); });
addEventListener("appinstalled", () => { installEvt = null; toast("Installed 🎉 Open Namaz Board from your home screen."); scheduleRender(); });
function installNudge(){
  // Phones only: on computers the browser's address bar already has an install icon.
  if (!installEvt || standalone || !matchMedia("(pointer: coarse)").matches) return "";
  try { if (localStorage.getItem("nb-install-hide")==="1") return ""; } catch {}
  return `<div class="notice"><span>📲 <b>Install Namaz Board</b> as an app on this phone.</span><div class="btns"><button class="primary" data-act="install">Install</button><button class="ghost" data-act="hideinstall">Later</button></div></div>`;
}
function alertsNudge(){
  if (!meDoc() || S.pushOn || !pushSupported && !isIOS) return "";
  try { if (localStorage.getItem("nb-nudge-hide")==="1") return ""; } catch {}
  return `<div class="notice"><span>🔔 <b>Get a ping for every namaz</b>, even when your phone is locked.</span><div class="btns"><button class="primary" data-act="tab" data-tab="alerts">Set up</button><button class="ghost" data-act="hidenudge">Later</button></div></div>`;
}
const mins2hm = v => `${String(Math.floor(v/60)).padStart(2,"0")}:${String(v%60).padStart(2,"0")}`;
const hm2mins = s => { const [h,m] = String(s||"0:0").split(":").map(Number); return (h*60 + m) % 1440; };
function viewAlerts(){
  const m = meDoc();
  let body;
  if (isIOS && !standalone){
    body = `<p>On iPhone, alerts only work once Namaz Board is on your home screen:</p>
      <ol class="steps"><li>Open this page in <b>Safari</b>.</li><li>Tap the <b>Share</b> button (square with an arrow).</li><li>Tap <b>Add to Home Screen</b>, then <b>Add</b>.</li><li>Open Namaz Board from your home screen and come back here.</li></ol>
      <p class="note">Needs iOS 16.4 or newer.</p>`;
  } else if (!pushSupported){
    body = `<p>This browser can't receive notifications. On Android use Chrome; on iPhone use Safari and add the app to your home screen.</p>`;
  } else if (Notification.permission === "denied"){
    body = `<p>Notifications are blocked for this app. Open your phone's settings for Namaz Board (or this site in your browser), allow notifications, then come back.</p>`;
  } else if (!S.pushOn){
    body = `<p>Turn on alerts on this phone. You can do this on each device you use.</p><div class="btns"><button class="primary" data-act="pushon">Turn on alerts 🔔</button></div>`;
  } else {
    body = `<p class="okline">🔔 Alerts are on for this phone.</p><div class="btns"><button class="primary" data-act="pushtest">Send a test</button><button class="ghost" data-act="pushoff">Turn off on this phone</button></div>`;
  }
  return `<section class="panel"><h3>Namaz alerts</h3>${body}</section>
    <section class="panel"><h3>What to send me</h3>
      <label class="tog"><input type="checkbox" id="n-start" data-act="ntoggle" ${m.notifyStart!==false?"checked":""}><span><b>When each waqt starts</b><br><small>“🌸 It's Asr time · ends 5:14 pm”</small></span></label>
      <label class="tog"><input type="checkbox" id="n-end" data-act="ntoggle" ${m.notifyEnd!==false?"checked":""}><span><b>Streak saver</b><br><small>30 min before a waqt ends, only if you haven't logged its fardh</small></span></label>
      <label class="tog"><input type="checkbox" id="n-recap" data-act="ntoggle" ${m.notifyRecap!==false?"checked":""}><span><b>Weekly recap</b><br><small>Sunday at 8 pm: your week's fardh and streak, with a card to share</small></span></label>
      <label class="tog"><input type="checkbox" id="n-jumuah" data-act="ntoggle" ${m.notifyJumuah?"checked":""}><span><b>Jumu'ah reminder</b><br><small>On Fridays, 1 hour before Dhuhr, with a nudge to read Surah Al-Kahf</small></span></label>
      <p class="note">Alerts use your city and times from Settings. Most phones also show them on a smartwatch.</p></section>
    <section class="panel"><h3>Quiet hours</h3><p>No alerts during these hours, for example while you sleep. Alerts for Fajr may be skipped if they fall inside.</p>
      <label class="tog"><input type="checkbox" id="q-on" data-act="ntoggle" ${m.quietStart!=null?"checked":""}><span><b>Use quiet hours</b></span></label>
      <div class="grid2"><label class="f">From<input type="time" id="q-from" data-act="ntoggle" value="${mins2hm(m.quietStart ?? 1380)}"></label><label class="f">Until<input type="time" id="q-to" data-act="ntoggle" value="${mins2hm(m.quietEnd ?? 360)}"></label></div></section>`;
}

/* ---------- auth screens ---------- */
const LANG = (() => { try { return localStorage.getItem("nb-lang") === "bn" ? "bn" : "en"; } catch { return "en"; } })();
function langPicker(){
  return `<div class="langpick" data-notr role="group" aria-label="Language"><button type="button" class="${LANG==="en"?"on":""}" data-act="lang" data-lang="en">English</button><button type="button" class="${LANG==="bn"?"on":""}" data-act="lang" data-lang="bn">বাংলা</button></div>`;
}
/* Opened inside Instagram, Facebook, Messenger, Snapchat, TikTok, LinkedIn…: Google sign-in, installing and alerts don't work there. */
const IN_APP = /FBAN|FBAV|FB_IAB|Instagram|Messenger|Snapchat|musical_ly|TikTok|BytedanceWebview|LinkedInApp|Line\/|MicroMessenger|; wv\)/i.test(navigator.userAgent);
function inAppBanner(){
  if (!IN_APP) return "";
  const android = /Android/i.test(navigator.userAgent);
  let code = ""; try { code = localStorage.getItem("nb-join") || ""; } catch {}   // keep the group invite when moving to Chrome
  const chromeUrl = `intent://${location.host}${location.pathname}${code ? "?g="+encodeURIComponent(code) : ""}#Intent;scheme=https;package=com.android.chrome;end`;
  return `<div class="notice inapp"><span>⚠️ <b>You're inside another app's browser.</b> Google sign-in, installing and alerts won't work here. ${android ? "Open it in Chrome instead." : "Tap <b>•••</b> or the share icon, then <b>Open in Safari</b>."}</span>
    ${android ? `<div class="btns"><a class="primary btnlink" href="${esc(chromeUrl)}">Open in Chrome</a></div>` : ""}</div>`;
}
/* ---------- accounts without email ---------- */
const CODE_DOMAINS = ["namaz-board.invalid", "namaz-board.example.com"];  // keep in sync with the notify function
const isCodeEmail = e => CODE_DOMAINS.some(d => String(e||"").toLowerCase().endsWith("@"+d));
const emailLabel = e => isCodeEmail(e) ? "🔑 no email (signs in with a code)" : e;
function parseCode(c){
  let a = String(c||"").toUpperCase().replace(/[^A-Z0-9]/g,""); if (a.startsWith("NB")) a = a.slice(2);
  return a.length === 20 ? {handle:a.slice(0,8).toLowerCase(), pw:a.slice(8)} : null;
}
async function signInWithCode(code){
  const p = parseCode(code); if (!p) return "That code doesn't look right. It has 20 letters and numbers after NB.";
  for (const d of CODE_DOMAINS){
    const {error} = await S.sb.auth.signInWithPassword({email:`nb-${p.handle}@${d}`, password:p.pw});
    if (!error) return null;
  }
  return "That code didn't work. Check it and try again.";
}
const savedCode = () => { try { return localStorage.getItem("nb-code") || ""; } catch { return ""; } };
const saveCode = c => { try { localStorage.setItem("nb-code", c); } catch {} };
function codeCard(code, fresh){
  return `<section class="panel codecard"><h3>🔑 ${fresh ? "Save your Namaz Board code" : "Your Namaz Board code"}</h3>
    <p>${fresh ? "This is the only way back into your account on a new phone, or if this browser's data is cleared. Screenshot it or save it somewhere safe." : "Use it to sign in on another phone or after clearing this browser."}</p>
    <div class="codebox" data-notr>${esc(code)}</div>
    <div class="btns"><button class="primary" data-act="copycode" data-code="${esc(code)}">Copy</button>${fresh ? `<button class="ghost" data-act="codesaved">I've saved it ✓</button>` : ""}</div></section>`;
}
/* Signing out of an account without email: show the code first, so nobody gets locked out by accident. */
function leaveDialog(){
  const code = savedCode();
  let el = $("leave"); if (!el){ el = document.createElement("div"); el.id = "leave"; el.className = "tour"; el.setAttribute("role","dialog"); el.setAttribute("aria-modal","true"); document.body.appendChild(el); }
  el.innerHTML = `<div class="tcard"><h3>Leave this account?</h3>
    <p>This account has no email, so the <b>only</b> way back in is its Namaz Board code${code ? ":" : "."}</p>
    ${code ? `<div class="codebox" data-notr>${esc(code)}</div><div class="btns"><button class="ghost" data-act="copycode" data-code="${esc(code)}">Copy code</button></div>`
      : `<p class="note">This phone doesn't have the code saved. Make a new one in Settings first if you want to come back.</p>`}
    <div class="btns"><button class="primary" data-act="leaveclose">Stay here</button><button class="ghost" data-act="signout" data-sure="1">Leave account</button></div></div>`;
  el.querySelector(".primary")?.focus();
}
function viewNoMail(){
  if (S.loginMode === "restore") return `<form class="panel hero-login" id="restoreForm"><h3>Sign in with your code 🔑</h3>
    <p>Type the Namaz Board code you were given when you signed up. It starts with NB.</p>
    <label class="f">Namaz Board code<input id="rc-code" required autocomplete="off" placeholder="NB-XXXX-XXXX-XXXX-XXXX-XXXX" style="text-transform:uppercase;letter-spacing:.06em"></label>
    <div class="btns"><button class="primary" type="submit">Sign in</button><button class="ghost" type="button" data-act="loginback">Back</button></div></form>`;
  return `<section class="panel hero-login"><h3>Sign up without email</h3>
    <p>No email or Google needed. Instead, we'll give you a <b>Namaz Board code</b>: your own secret key for signing in.</p>
    <div class="notice"><span>⚠️ Your account is saved on <b>this device</b>. If you change phones or clear your browser, you'll need your Namaz Board code to get back in. Lose the code, and your streak can't be recovered.</span></div>
    <div class="btns"><button class="primary" data-act="nomailgo">Create my account</button><button class="ghost" data-act="loginback">Back</button></div></section>`;
}
function viewLogin(){
  if (S.loginMode) return inAppBanner() + viewNoMail();
  return inAppBanner() + langPicker() + inviteBanner() + `<section class="panel hero-login"><h3>Pray together, streak together 🔥</h3>
    <p>Log your five daily namaz, keep your streak alive, and see how your friends are doing.</p>
    <button class="gbtn" data-act="google"><svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>Continue with Google</button>
    <p class="altlogin">No Gmail? <button class="linkbtn" data-act="nomail">Sign up without email</button></p>
    <p class="altlogin">Signed up without email before? <button class="linkbtn" data-act="restore">Sign in with your Namaz Board code</button></p>
    <p class="note">New here? Sign in and tap <b>Ask to join</b>. ${esc(CONF.ownerName||"The board owner")} will approve you.</p></section>` + watermark();
}
function inviteBanner(){
  const pv = S.linkGroup; if (!pv?.name) return "";
  return `<div class="notice"><span>👥 You're invited to <b data-notr>${esc(pv.name)}</b>. Join the board first, then you'll be asked to join the group.</span></div>`;
}
function viewNotInvited(){
  const owner = esc(CONF.ownerName||"the board owner");
  const fresh = S.newCode ? codeCard(S.newCode, true) : "";
  if (S.myRequest) return fresh + `<section class="panel hero-login"><h3>Request sent 💌</h3>
    <p>${owner} has been asked to let <b>${esc(S.myRequest.name)}</b> in. This page opens the board by itself once you're approved, so you can close it and come back later.</p>
    <div class="waiting" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="btns"><button class="ghost" data-act="cancelreq">Cancel request</button><button class="ghost" data-act="signout">← Back to sign in</button></div>
    <p class="note">Signed in as ${esc(emailLabel(S.email))}</p></section>` + inviteBanner();
  const meta = S.session?.user?.user_metadata || {};
  const guess = meta.given_name || (meta.full_name||"").split(" ")[0] || "";
  return fresh + inviteBanner() + `<form class="panel" id="reqForm"><h3>Ask to join 🌸</h3>
    <p>Namaz Board is invite only. Send a request and ${owner} will approve it.</p>
    <label class="f">Your name<input id="r-name" maxlength="40" required value="${esc(guess)}"></label>
    <label class="f">Message (optional)<input id="r-note" maxlength="200" placeholder="Salaam! It's Raisa from uni"></label>
    <div class="btns"><button class="primary" type="submit">Ask to join</button><button class="ghost" type="button" data-act="signout">← Back to sign in</button></div>
    <p class="note">Signed in as ${esc(emailLabel(S.email))}</p></form>`;
}

function showMilestone(ms){
  let el = $("tour"); if (!el){ el = document.createElement("div"); el.id = "tour"; el.className = "tour"; el.setAttribute("role","dialog"); el.setAttribute("aria-modal","true"); document.body.appendChild(el); }
  el.innerHTML = `<div class="tcard milestone"><div class="bigbadge">${ms.e}</div><h3>${ms.t} streak!</h3>
    <p>MashaAllah! You've prayed all 5 fardh for <b>${ms.n} days</b> in a row. Your new badge now shows next to your name.</p>
    <div class="btns"><button class="primary" data-act="tourdone">Alhamdulillah ✨</button></div></div>`;
  el.querySelector(".primary")?.focus();
}

/* ---------- welcome tour ---------- */
function tourSteps(){
  const name = esc(meDoc()?.name || "friend");
  return [
    {art:`<div class="tart moon">🌙</div>`, h:`Assalamu alaikum, ${name} 🌸`,
     p:"Namaz Board helps you and your friends keep your five daily namaz, together. Here's how it works in 30 seconds."},
    {art:`<div class="tart"><span class="fard demo"><span class="box"></span>Fardh<small>4</small></span><span class="chip demo">Sunnah<small>4</small></span></div>`, h:"Log each namaz",
     p:"After you pray, tap the pink <b>Fardh</b> button. Tap Sunnah, Nafl or Witr too if you prayed them. You have <b>24 hours</b> to log each namaz, so a forgotten tap is fine."},
    {art:`<div class="tart"><span class="tflame">${flameSvg(true)}</span></div>`, h:"Keep your streaks",
     p:"🔥 grows each day you pray <b>all 5</b> fardh. Below it, <b>6/7</b> means 6 of the 7 fardh since you joined, so every single fardh counts. Travelling, ill or can't pray? Tap <b>Excuse this day</b>: your streak pauses, and <b>only you</b> can see it."},
    {art:`<div class="tart">${["🌍","👥","🔒"].map(e=>`<span class="temo">${e}</span>`).join("")}</div>`, h:"Friends & groups",
     p:"<b>🌍 Public</b> puts your streak, grade and today's fardh on the Everyone board; <b>🔒 Private</b> hides you there. <b>Groups</b> share your 🔥 streak and today's fardh rings with just the people you choose, and you can nudge each other there. Invite friends from the Board tab."}
  ];
}
function renderTour(){
  let el = $("tour");
  if (S.tour == null){ if (el) el.remove(); return; }
  const steps = tourSteps(), i = S.tour, st = steps[i], last = i === steps.length-1;
  if (!el){ el = document.createElement("div"); el.id = "tour"; el.className = "tour"; el.setAttribute("role","dialog"); el.setAttribute("aria-modal","true"); document.body.appendChild(el); }
  el.innerHTML = `<div class="tcard">${st.art}<h3>${st.h}</h3><p>${st.p}</p>
    <div class="tdots">${steps.map((_,k)=>`<i class="${k===i?"on":""}"></i>`).join("")}</div>
    <div class="btns">${last ? `${pushSupported || isIOS ? `<button class="primary" data-act="tourdone" data-then="alerts">Turn on alerts 🔔</button>` : ""}<button class="${pushSupported || isIOS ? "ghost" : "primary"}" data-act="tourdone">Start</button>`
      : `<button class="primary" data-act="tournext">Next</button><button class="ghost" data-act="tourdone">Skip</button>`}</div></div>`;
  el.querySelector(".primary")?.focus();
}
function maybeTour(){
  let seen = false; try { seen = localStorage.getItem("nb-tour-v1") === "1"; } catch {}
  if (!seen && meDoc()){ S.tour = 0; renderTour(); }
}

/* ---------- render ---------- */
function render(){
  renderSky();
  const member = !!meDoc();
  document.querySelector(".nav").hidden = !member;
  document.querySelectorAll(".nav button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.tab===S.view)));
  $("settingsBtn").hidden = !member; $("bellBtn").hidden = !member;
  if (S.admin && S.requests.length) $("settingsBtn").dataset.badge = S.requests.length; else delete $("settingsBtn").dataset.badge;
  $("bellBtn").classList.toggle("on", S.pushOn);
  $("hello").textContent = meDoc()?.name ? `Assalamu alaikum, ${meDoc().name} ✨` : "Assalamu alaikum ✨";
  const main = $("main");
  if (S.phase==="boot"){ main.innerHTML = `<div class="empty">${esc(S.err || "Loading…")}</div>`; return; }
  if (S.phase==="config"){ main.innerHTML = `<div class="panel"><h3>Almost there</h3><p>Fill in <b>config.js</b> with your Supabase URL, key and VAPID public key, then reload.</p></div>`; return; }
  if (S.phase==="login"){ main.innerHTML = viewLogin(); return; }
  if (S.phase==="uninvited"){ main.innerHTML = viewNotInvited(); return; }
  if (S.phase==="join" || S.view==="settings"){
    if (!main.querySelector("#setupForm") || S.forceForm){ S.forceForm = false; main.innerHTML = viewSettings(); }
    return;
  }
  main.innerHTML = S.view==="today" ? viewToday() : S.view==="board" ? viewBoard() : S.view==="alerts" ? viewAlerts() : viewMe();
  let sh = $("nsheet"); if (!sh){ sh = document.createElement("div"); sh.id = "nsheet"; document.body.appendChild(sh); }
  const shHtml = S.nudgeTo ? nudgeSheet() : ""; if (sh.dataset.h !== shHtml){ sh.innerHTML = shHtml; sh.dataset.h = shHtml; }
  // Unread nudges: dot on the Board tab.
  let seen = ""; try { seen = localStorage.getItem("nb-nudge-seen") || ""; } catch {}
  const toMe = n => n.to_id===S.myId || (!n.to_id && n.from_id!==S.myId);
  const unread = S.nudges.some(n => toMe(n) && n.created_at > seen);
  document.querySelector('.nav [data-tab="board"]')?.classList.toggle("dot", unread);
  if (unread && S.view==="board" && S.gid!=="all"){ const last = S.nudges.filter(toMe).sort((a,b) => a.created_at < b.created_at ? 1 : -1)[0]; try { localStorage.setItem("nb-nudge-seen", last.created_at); } catch {} }
  S.pop = "";
}

/* ---------- events ---------- */
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-act],[data-tab]"); if (!b || b.disabled) return;
  const a = b.dataset.act;
  if (a==="ntoggle") return; // handled on change
  if (!a || a==="tab"){ S.view = b.dataset.tab; render(); scrollTo({top:0}); return; }
  if (a==="google"){
    const {error} = await S.sb.auth.signInWithOAuth({provider:"google", options:{redirectTo: location.origin + location.pathname, queryParams:{prompt:"select_account"}}});
    if (error) toast("Google sign-in isn't set up yet: " + error.message);
  }
  else if (a==="signout"){
    if (isCodeEmail(S.email) && !b.dataset.sure){ leaveDialog(); return; }
    await S.sb.auth.signOut(); location.reload();
  }
  else if (a==="recap"){ b.disabled = true; await openRecap(); b.disabled = false; }
  else if (a==="recapclose"){ $("recapDlg")?.remove(); }
  else if (a==="recapshare"){
    const file = new File([S.recapBlob], "namaz-week.png", {type:"image/png"});
    if (navigator.canShare?.({files:[file]})){ try { await navigator.share({files:[file]}); } catch {} return; }
    const a2 = document.createElement("a"); a2.href = S.recapUrl; a2.download = "namaz-week.png"; document.body.appendChild(a2); a2.click(); a2.remove(); toast("Saved to your downloads 📸");
  }
  else if (a==="leaveclose"){ $("leave")?.remove(); }
  else if (a==="nomail"){ S.loginMode = "new"; render(); }
  else if (a==="restore"){ S.loginMode = "restore"; render(); }
  else if (a==="loginback"){ S.loginMode = null; render(); }
  else if (a==="nomailgo"){
    b.disabled = true; b.textContent = "Creating…";
    const {data, error} = await S.sb.functions.invoke("notify",{body:{action:"newaccount"}});
    if (error || !data?.code){ b.disabled = false; b.textContent = "Create my account"; toast("Couldn't create an account right now. Try again in a minute."); return; }
    saveCode(data.code); S.newCode = data.code;
    const err = await signInWithCode(data.code);
    if (err){ toast(err); b.disabled = false; return; }
    S.loginMode = null; await afterAuth();
  }
  else if (a==="copycode"){ try { await navigator.clipboard.writeText(b.dataset.code); toast("Code copied ✓"); } catch { toast(b.dataset.code); } }
  else if (a==="codesaved"){ S.newCode = null; render(); }
  else if (a==="newcode"){
    if (!S.confirmNewCode){ S.confirmNewCode = true; S.forceForm = true; render(); setTimeout(() => { S.confirmNewCode = false; }, 5000); return; }
    S.confirmNewCode = false; b.disabled = true;
    const {data, error} = await S.sb.functions.invoke("notify",{body:{action:"newcode"}});
    if (error || !data?.code){ b.disabled = false; toast("Couldn't make a new code. Try again."); return; }
    saveCode(data.code); S.forceForm = true; render(); toast("New code ready. Save it somewhere safe 🔑");
  }
  else if (a==="recheck"){ await afterAuth(); }
  else if (a==="cancelreq"){
    const {error} = await S.sb.from("join_requests").delete().eq("user_id", S.myId);
    if (error) toast("Couldn't cancel. Try again."); else { S.myRequest = null; render(); }
  }
  else if (a==="approve"){
    b.disabled = true; const r = S.requests.find(x => x.user_id === b.dataset.id);
    const {error} = await S.sb.rpc("approve_request",{uid:b.dataset.id});
    if (error){ toast("Couldn't approve: " + error.message); b.disabled = false; return; }
    S.requests = S.requests.filter(x => x.user_id !== b.dataset.id);
    if (r && !S.invites.includes(r.email)) S.invites.push(r.email);
    toast(`Approved ${r?.name || ""} ✨ They're in.`); S.forceForm = true; render();
  }
  else if (a==="decline"){
    b.disabled = true;
    const {error} = await S.sb.from("join_requests").delete().eq("user_id", b.dataset.id);
    if (error){ toast("Couldn't decline. Try again."); b.disabled = false; return; }
    S.requests = S.requests.filter(x => x.user_id !== b.dataset.id); toast("Request declined"); S.forceForm = true; render();
  }
  else if (a==="settings"){ S.view = "settings"; S.forceForm = true; render(); scrollTo({top:0}); }
  else if (a==="bell"){ S.view = "alerts"; render(); scrollTo({top:0}); }
  else if (a==="pushon") enablePush();
  else if (a==="pushoff") disablePush();
  else if (a==="pushtest") testPush();
  else if (a==="install"){ if (!installEvt) return; installEvt.prompt(); try { await installEvt.userChoice; } catch {} installEvt = null; render(); }
  else if (a==="hideinstall"){ try { localStorage.setItem("nb-install-hide","1"); } catch {} render(); }
  else if (a==="tzok"){ try { localStorage.setItem("nb-tzok", b.dataset.key); } catch {} render(); }
  else if (a==="tzswitch"){
    const k = b.dataset.city, c = CITIES[k]; if (!c) return; b.disabled = true;
    const {error} = await S.sb.from("members").update({city:k, method:c.method, lat:null, lng:null, tz:null, place:null}).eq("id", S.myId);
    if (error){ b.disabled = false; toast("Couldn't save. Try again."); return; }
    Object.assign(meDoc(), {city:k, method:c.method, lat:null, lng:null, tz:null, place:null}); cache.clear(); pushMyStats(); render(); toast(`Now using ${c.name} times ✓`);
  }
  else if (a==="geo"){
    if (!navigator.geolocation){ toast("This browser can't share location. Pick your city from the list instead."); return; }
    $("geoNote").textContent = "Finding you…";
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = Math.round(pos.coords.latitude*10)/10, lng = Math.round(pos.coords.longitude*10)/10;
      const near = nearestCity(lat, lng), nc = CITIES[near.key];
      const place = near.km < 60 ? `Near ${nc.name}` : "My location";
      S.geo = {lat, lng, tz: TZ_ALIAS[DEVICE_TZ] || DEVICE_TZ || nc.tz, place};
      $("f-city").innerHTML = cityOptions(cfgOf(meDoc()||{}));
      if (near.km < 400) $("f-method").value = nc.method;
      $("geoNote").textContent = `Using ${place} (rounded to about 10 km). Tap Save.`;
    }, () => { $("geoNote").textContent = "Location wasn't shared. Pick your city from the list instead."; }, {enableHighAccuracy:false, timeout:15000, maximumAge:600000});
  }
  else if (a==="deleteme"){
    if (!S.confirmDelMe){ S.confirmDelMe = true; S.forceForm = true; render(); clearTimeout(S.dmT); S.dmT = setTimeout(()=>{ S.confirmDelMe = false; S.forceForm = true; render(); }, 5000); return; }
    S.confirmDelMe = false; b.disabled = true;
    try { const sub = await S.swReg?.pushManager.getSubscription(); if (sub) await sub.unsubscribe(); } catch {}
    const {error} = await S.sb.from("members").delete().eq("id", S.myId);
    if (error){ toast("Couldn't delete your account. Try again."); b.disabled = false; return; }
    await S.sb.from("join_requests").delete().eq("user_id", S.myId);
    try { localStorage.clear(); } catch {}
    await S.sb.auth.signOut(); toast("Your account and logs were deleted."); setTimeout(() => location.reload(), 1200);
  }
  else if (a==="qdone"){ const k = b.dataset.k, q = S.qaza[k] || {owed:0, done:0}, total = q.owed + (autoMissed()[k]||0);
    if (await saveQaza(k, {done:q.done+1})){ render(); toast(total - q.done - 1 > 0 ? "Made up ✓ MashaAllah" : "All made up ✨ MashaAllah"); } }
  else if (a==="tour"){ S.tour = 0; renderTour(); }
  else if (a==="tournext"){ S.tour++; renderTour(); }
  else if (a==="tourdone"){ S.tour = null; renderTour(); try { localStorage.setItem("nb-tour-v1","1"); } catch {} if (b.dataset.then){ S.view = b.dataset.then; render(); scrollTo({top:0}); } }
  else if (a==="lang"){
    const v = b.dataset.lang; if (v === LANG) return;
    try { localStorage.setItem("nb-lang", v); } catch {}
    if (meDoc()) { try { await S.sb.from("members").update({lang:v}).eq("id", S.myId); } catch {} }
    location.reload();
  }
  else if (a==="hidenudge"){ try { localStorage.setItem("nb-nudge-hide","1"); } catch {} render(); }
  else if (a==="nudge"){ S.nudgeTo = {id:b.dataset.id, gid:nudgeGroup(b.dataset.id, b.dataset.gid)}; render(); }
  else if (a==="nudgeclose"){ S.nudgeTo = null; render(); }
  else if (a==="nudgeall"){ S.nudgeTo = {all:true, gid:b.dataset.gid}; render(); }
  else if (a==="nudgesend" && S.nudgeTo?.all){
    const {gid} = S.nudgeTo, tg = nudgeTarget(S.myId); b.disabled = true;
    if (await sendNudge({group_id:gid, to_id:null, kind:b.dataset.k, waqt:tg.waqt, day:tg.day})){ toast("Sent to everyone 📢"); celebrate(); S.nudgeTo = null; }
    render();
  }
  else if (a==="nudgesend"){
    const {id, gid} = S.nudgeTo, tg = nudgeTarget(id); b.disabled = true;
    if (await sendNudge({group_id:gid, to_id:id, kind:b.dataset.k, waqt:tg.waqt, day:tg.day})){
      toast(`Sent to ${S.members[id]?.name || "them"} 🚀`); if (b.dataset.k[0]==="h") celebrate(); S.nudgeTo = null; }
    render();
  }
  else if (a==="nudgereply"){
    const n = S.nudges.find(x => x.id===+b.dataset.id); if (!n) return; b.disabled = true;
    if (await sendNudge({group_id:n.group_id, to_id:n.from_id, kind:b.dataset.k, waqt:n.waqt, day:n.day, reply_to:n.id})) toast("Replied 💬");
    render();
  }
  else if (a==="openfr"){ S.nudgeTo = null; if (b.dataset.id===S.myId) S.view = "me"; else { S.view = "board"; S.gid = b.dataset.gid || "all"; S.gform = null; S.open = b.dataset.id; } render(); scrollTo({top:0}); }
  else if (a==="vis"){
    if (!S.confirmVis){ S.confirmVis = true; render(); clearTimeout(S.visT); S.visT = setTimeout(()=>{ S.confirmVis = false; render(); }, 4000); return; }
    clearTimeout(S.visT); S.confirmVis = false;
    const to = !isPub(S.myId);
    const {error} = await S.sb.from("members").update({is_public:to}).eq("id", S.myId);
    if (error) toast("Couldn't change that. Try again in a moment.");
    else { meDoc().isPublic = to; toast(to ? "🌍 You're public. You're on the Everyone board." : "🔒 You're private. Hidden from the Everyone board; your groups still see you."); }
    render();
  }
  else if (a==="excuse"){
    const ds = b.dataset.ds, on = S.excused.has(ds);
    if (!on && S.confirmEx !== ds){ S.confirmEx = ds; render(); clearTimeout(S.exT); S.exT = setTimeout(()=>{ S.confirmEx = null; render(); }, 4000); return; }
    S.confirmEx = null; clearTimeout(S.exT);
    const q = on ? S.sb.from("excused").delete().eq("user_id",S.myId).eq("day",ds) : S.sb.from("excused").insert({user_id:S.myId, day:ds});
    const {error} = await q;
    if (error){ toast("Couldn't save that. Try again."); return; }
    on ? S.excused.delete(ds) : S.excused.add(ds);
    pushMyStats(); render(); toast(on ? "Excuse removed" : "⏸ Day excused. Your streak is paused. Only you can see this.");
  }
  else if (a==="gpick"){ S.gid = b.dataset.id; S.gform = null; S.gmanage = false; S.open = null; render(); }
  else if (a==="gnew"){ S.gform = "new"; render(); }
  else if (a==="gjoin"){ S.gform = "join"; S.joinCode = ""; S.preview = null; render(); }
  else if (a==="gcancel"){ S.gform = null; render(); }
  else if (a==="gmanage"){ S.gmanage = !S.gmanage; render(); }
  else if (a==="ginvite"){
    const link = b.dataset.link, text = `Join my Namaz Board group 🌸 ${link} (code ${b.dataset.code})`;
    // Phones: the share sheet (WhatsApp, Messenger…). Computers: just copy, since their share menus rarely have chat apps.
    const phone = matchMedia("(pointer: coarse)").matches;
    if (phone && navigator.share){ try { await navigator.share({title:"Namaz Board", text}); } catch {} return; }
    try { await navigator.clipboard.writeText(text); toast("Invite link copied. Paste it to your friends."); } catch { toast(`Group code: ${b.dataset.code}`); }
  }
  else if (a==="gcopy"){
    const text = `Join my Namaz Board group 🌸 ${b.dataset.link} (code ${b.dataset.code})`;
    try { await navigator.clipboard.writeText(text); toast("Invite link copied. Paste it to your friends."); } catch { toast(`Group code: ${b.dataset.code}`); }
  }
  else if (a==="gkick"){
    const id = b.dataset.id, g = curGroup();
    if (S.confirmKick !== id){ S.confirmKick = id; render(); return; }
    S.confirmKick = null;
    const {error} = await S.sb.from("group_members").delete().eq("group_id", g.id).eq("user_id", id);
    if (error) toast("Couldn't remove them."); else { S.gmembers[g.id] = (S.gmembers[g.id]||[]).filter(x => x!==id); toast("Removed from the group"); }
    render();
  }
  else if (a==="gleave"){
    const gid = b.dataset.id;
    if (S.confirmLeave !== gid){ S.confirmLeave = gid; render(); return; }
    S.confirmLeave = null;
    const {error} = await S.sb.from("group_members").delete().eq("group_id", gid).eq("user_id", S.myId);
    if (error) toast("Couldn't leave. Try again."); else { S.gmanage = false; await syncChanges(); toast("You left the group"); }
    render();
  }
  else if (a==="gdelete"){
    const gid = b.dataset.id;
    if (S.confirmDel !== gid){ S.confirmDel = gid; render(); return; }
    S.confirmDel = null;
    const {error} = await S.sb.from("groups").delete().eq("id", gid);
    if (error) toast("Couldn't delete it."); else { S.gmanage = false; await syncChanges(); toast("Group deleted"); }
    render();
  }
  else if (a==="uninvite"){
    const {error} = await S.sb.from("invites").delete().eq("email", b.dataset.e);
    if (error) toast("Couldn't remove that invite."); else { S.invites = S.invites.filter(x=>x!==b.dataset.e); S.forceForm = true; render(); }
  }
  else if (a==="rm"){
    const id = b.dataset.id;
    if (S.confirmRm !== id){ S.confirmRm = id; S.forceForm = true; render(); return; }
    S.confirmRm = null; b.disabled = true;
    let {error} = await S.sb.rpc("admin_remove_member", {uid:id});
    if (error && /function|schema cache/i.test(error.message||"")) ({error} = await S.sb.from("members").delete().eq("id", id)); // before update 008
    if (error) toast("Couldn't remove them. Try again in a moment."); else { delete S.members[id]; toast("Removed. Their invite was cancelled too."); }
    S.forceForm = true; render();
  }
  else if (a==="day"){ S.dayOff = Number(b.dataset.d); render(); }
  else if (a==="period"){ S.period = b.dataset.p; render(); }
  else if (a==="open"){ S.open = S.open===b.dataset.id ? null : b.dataset.id; render(); }
  else if (a==="qtog"){
    const {ds,k} = b.dataset, cur = codeOf(S.myId,ds,k);
    if (cur.includes("f")) return;
    const next = cur.includes("q") ? cur.replace("q","") : cur + "q";
    queue(ds,k,next); render(); if (next.includes("q")) toast("Made up as qaza 🤲 MashaAllah");
  }
  else if (a==="tog"){
    const {ds,k,c} = b.dataset, cur = codeOf(S.myId,ds,k);
    const cfg = cfgOf(meDoc()), st = chipStart(cfg,ds,k,c), now = new Date();
    if (now < st || now >= new Date(+st+DAY)){ toast("That namaz's logging window has closed."); render(); return; }
    const before = dayState(S.myId,ds,now).s, sBefore = streakOf(S.myId,now);
    let next = cur.includes(c) ? cur.replace(c,"") : cur + c;
    if (c==="f" && next.includes("f")) next = next.replace("q","");   // prayed on time after all
    queue(ds,k,next);
    if (c==="f" && next.includes("f")) S.pop = ds+k+"f";
    render();
    if (c==="f" && before!=="done" && dayState(S.myId,ds,now).s==="done"){
      const n = streakOf(S.myId,now); celebrate();
      const ms = MILESTONES.find(x => x.n === n && n > sBefore);
      if (ms){ setTimeout(celebrate, 700); showMilestone(ms); }
      else toast(n > sBefore ? `🔥 ${n}-day streak! All 5 fardh done.` : "All 5 fardh done for the day.");
    }
  }
});
document.addEventListener("keydown", e => { if (e.key==="Escape" && S.tour!=null){ S.tour = null; renderTour(); try { localStorage.setItem("nb-tour-v1","1"); } catch {} } });
document.addEventListener("change", e => {
  if (e.target.id !== "f-city") return;
  if (e.target.value !== "custom"){ S.geo = null; const c = CITIES[e.target.value]; if (c && $("f-method")) $("f-method").value = c.method; }
});
document.addEventListener("keydown", e => { if (e.key==="Escape" && S.nudgeTo){ S.nudgeTo = null; render(); } });
document.addEventListener("input", async e => {
  if (e.target.id !== "g-code") return;
  const v = e.target.value.toUpperCase(); S.joinCode = v;
  await lookupGroup(v); refreshPreview();
});
document.addEventListener("change", async e => {
  if (e.target.dataset.qown){ const k = e.target.dataset.qown; if (await saveQaza(k, {owed: Number(e.target.value)||0})) render(); }
});
document.addEventListener("change", async e => {
  if (e.target.dataset.act !== "ntoggle") return;
  const on = $("q-on")?.checked;
  const patch = {notify_start:$("n-start").checked, notify_end:$("n-end").checked, notify_jumuah:$("n-jumuah").checked, notify_recap:$("n-recap")?.checked !== false,
    quiet_start: on ? hm2mins($("q-from").value) : null, quiet_end: on ? hm2mins($("q-to").value) : null};
  let {error} = await S.sb.from("members").update(patch).eq("id", S.myId);
  if (error && /notify_recap/.test(error.message||"")){ const {notify_recap:_, ...rest} = patch; ({error} = await S.sb.from("members").update(rest).eq("id", S.myId)); }
  if (error) toast(/column/i.test(error.message||"") ? "This setting needs the latest database update." : "Couldn't save that setting.");
  else { Object.assign(meDoc(), {notifyStart:patch.notify_start, notifyEnd:patch.notify_end, notifyJumuah:patch.notify_jumuah, quietStart:patch.quiet_start, quietEnd:patch.quiet_end, notifyRecap:patch.notify_recap}); toast("Saved"); }
});
document.addEventListener("submit", async e => {
  e.preventDefault();
  if (e.target.id === "reqForm"){
    const name = $("r-name").value.trim().slice(0,40), note = $("r-note").value.trim().slice(0,200) || null;
    if (!name) return;
    const btn = e.target.querySelector("button[type=submit]"); btn.disabled = true;
    const {data, error} = await S.sb.from("join_requests").insert({user_id:S.myId, email:S.email, name, note}).select().single();
    if (error){ btn.disabled = false; toast(/duplicate/i.test(error.message) ? "You've already asked. Hang tight!" : "Couldn't send: " + error.message); return; }
    S.myRequest = data; render(); return;
  }
  if (e.target.id === "gNewForm"){
    const name = $("g-name").value.trim().slice(0,30); if (!name) return;
    const mode = "full";
    const {data, error} = await S.sb.from("groups").insert({name, mode, owner:S.myId}).select().single();
    if (error){ toast("Couldn't create it: " + error.message); return; }
    S.gform = null; await syncChanges(); S.gid = data.id; pushMyStats(); render(); toast("Group created 🌸 Tap Invite to share it.");
    return;
  }
  if (e.target.id === "restoreForm"){
    const btn = e.target.querySelector("[type=submit]"); btn.disabled = true;
    const code = $("rc-code").value, err = await signInWithCode(code);
    if (err){ btn.disabled = false; toast(err); return; }
    const pc = parseCode(code), h = pc.handle.toUpperCase(), w = pc.pw;
    saveCode(`NB-${h.slice(0,4)}-${h.slice(4)}-${w.slice(0,4)}-${w.slice(4,8)}-${w.slice(8)}`); S.loginMode = null; await afterAuth(); return;
  }
  if (e.target.id === "gJoinForm"){ await joinWithCode($("g-code").value); return; }
  if (e.target.id === "gEditForm"){
    const gid = e.target.dataset.id, name = $("ge-name").value.trim().slice(0,30), mode = "full";
    const {error} = await S.sb.from("groups").update({name, mode}).eq("id", gid);
    if (error){ toast("Couldn't save."); return; }
    Object.assign(S.groups.find(g => g.id===gid), {name, mode}); S.gmanage = false; await syncChanges(); render(); toast("Saved");
    return;
  }
  if (e.target.id === "inviteForm"){
    const email = $("f-invite").value.trim().toLowerCase(); if (!email) return;
    const {error} = await S.sb.from("invites").upsert({email});
    if (error) toast("Couldn't add that invite."); else { if (!S.invites.includes(email)) S.invites.push(email); toast(`Invited ${email}`); S.forceForm = true; render(); }
    return;
  }
  if (e.target.id !== "setupForm") return;
  const name = $("f-name").value.trim().slice(0,24); if (!name) return;
  const prof = {name, city:$("f-city").value, method:$("f-method").value, madhab:$("f-madhab").value, show_extras:$("f-extras").checked, is_public:$("f-public").checked};
  if (prof.city==="custom"){ const g = S.geo || meDoc(); Object.assign(prof, {lat:g.lat, lng:g.lng, tz:g.tz, place:g.place}); }
  const btn = e.target.querySelector("button[type=submit]"); btn.disabled = true;
  try {
    if (meDoc()){
      const {error} = await S.sb.from("members").update(prof).eq("id", S.myId); if (error) throw error;
      Object.assign(meDoc(), rowToMember({...prof, notify_start:meDoc().notifyStart, notify_end:meDoc().notifyEnd, joined:meDoc().joined}, meDoc()));
    } else {
      const joined = appDay(cfgOf(prof));
      const {data, error} = await S.sb.from("members").insert({id:S.myId, ...prof, joined}).select().single(); if (error) throw error;
      await loadAll(); S.members[S.myId] ||= rowToMember(data); subscribeLive(); checkPush();
      S.phase = "app"; celebrate(); pushMyStats(); setTimeout(maybeTour, 1200);
      let code = null; try { code = localStorage.getItem("nb-join"); } catch {}
      if (code) setTimeout(() => openJoin(code), 600);
    }
    S.geo = null; cache.clear(); S.view = "today"; S.dayOff = 0; render(); toast("Saved");
  } catch(err){
    btn.disabled = false; toast("Couldn't save: " + (err?.message || "try again in a moment."));
  }
});

async function joinWithCode(code){
  code = String(code||"").trim().toUpperCase(); if (!code) return;
  const {data:gid, error} = await S.sb.rpc("join_group",{join_code:code});
  try { localStorage.removeItem("nb-join"); } catch {}
  S.joinCode = ""; S.preview = null;
  if (error){ toast(/no group/i.test(error.message) ? "No group has that code. Check it and try again." : "Couldn't join: " + error.message); return; }
  S.gform = null; await syncChanges(); S.gid = gid; S.view = "board"; pushMyStats(); render();
  toast(`Joined ${S.groups.find(g => g.id===gid)?.name || "the group"} 🎉`);
}

/* ---------- boot ---------- */
async function afterAuth(){
  if (S.authing) return; S.authing = true;
  try { await afterAuthInner(); } finally { S.authing = false; }
}
async function afterAuthInner(){
  const {data:{session}} = await S.sb.auth.getSession();
  S.session = session;
  if (!session){ S.phase = "login"; render(); return; }
  S.myId = session.user.id; S.email = (session.user.email||"").toLowerCase();
  const [inv, adm] = await Promise.all([S.sb.rpc("is_invited"), S.sb.rpc("is_admin")]);
  S.invited = !!inv.data; S.admin = !!adm.data;
  if (S.admin){
    const [{data}, {data:reqs}] = await Promise.all([S.sb.from("invites").select("email").order("added_at"), S.sb.from("join_requests").select("*").order("created_at")]);
    S.invites = (data||[]).map(r=>r.email); S.requests = reqs || [];
  }
  const {data:me} = await S.sb.from("members").select("*").eq("id",S.myId).maybeSingle();
  if (!me){
    if (!S.invited){ const {data:req} = await S.sb.from("join_requests").select("*").eq("user_id",S.myId).maybeSingle(); S.myRequest = req || null; }
    S.phase = S.invited ? "join" : "uninvited"; render(); return;
  }
  try { await loadAll(); } catch(e){ S.err = "Couldn't load the board. Check your connection and reload."; S.phase="boot"; render(); return; }
  S.phase = "app"; subscribeLive(); await checkPush(); render(); pushMyStats(); maybeTour();
  let code = null; try { code = localStorage.getItem("nb-join"); } catch {}
  if (code) await openJoin(code);
}
/* Opened an invite link: show the group's name and let them tap Join. */
async function openJoin(code){
  code = String(code).toUpperCase();
  try { localStorage.removeItem("nb-join"); } catch {}
  if (S.groups.some(g => g.code === code)){ S.gid = S.groups.find(g => g.code === code).id; S.view = "board"; render(); return; }
  S.view = "board"; S.gform = "join"; S.joinCode = code; await lookupGroup(code); render(); scrollTo({top:0});
}
async function boot(){
  render();
  setInterval(renderSky, 1000);
  setInterval(() => { if (S.phase==="app" && S.view!=="settings" && S.view!=="alerts") render(); }, 30000);
  // Waiting for approval: check every 15 s and open the board as soon as it's granted.
  setInterval(async () => {
    if (S.phase!=="uninvited" || !S.myRequest || document.visibilityState!=="visible") return;
    const {data} = await S.sb.rpc("is_invited");
    if (data){ toast("You're approved! 🎉"); await afterAuth(); }
  }, 15000);
  if ("serviceWorker" in navigator){
    try { S.swReg = await navigator.serviceWorker.register("./sw.js"); await navigator.serviceWorker.ready; } catch {}
  }
  if (!CONF.supabaseUrl || CONF.supabaseUrl.includes("YOUR-")){ S.phase = "config"; render(); return; }
  S.sb = supabase.createClient(CONF.supabaseUrl, CONF.supabaseKey, {auth:{persistSession:true, autoRefreshToken:true, detectSessionInUrl:true, flowType:"pkce"}});
  S.sb.auth.onAuthStateChange((ev) => { if (ev==="SIGNED_IN" && S.phase!=="app" && S.phase!=="join") afterAuth(); });
  const qs = new URLSearchParams(location.search), qv = qs.get("view"), qg = qs.get("g");
  if (qg){ try { localStorage.setItem("nb-join", qg.toUpperCase()); } catch {} }
  { let c = null; try { c = localStorage.getItem("nb-join"); } catch {}
    if (c) S.sb.rpc("group_preview",{join_code:c}).then(({data}) => { if (data?.[0]){ S.linkGroup = data[0]; if (S.phase!=="app") render(); } }, () => {}); }
  if (qv || qg){ history.replaceState(null,"",location.pathname); if (qv==="requests") S.pendingView = "settings"; if (qv==="board"){ S.view = "board"; if (qs.get("gid")) S.gid = qs.get("gid"); } if (qv==="recap") S.openRecap = true; }
  await afterAuth();
  if (meDoc()){
    let saved = null; try { saved = localStorage.getItem("nb-lang"); } catch {}
    const theirs = meDoc().lang;
    if (!saved && theirs === "bn"){ try { localStorage.setItem("nb-lang","bn"); } catch {} location.reload(); return; }
    if (saved && theirs && theirs !== saved) S.sb.from("members").update({lang:saved}).eq("id", S.myId).then(()=>{}, ()=>{});
  }
  if (S.openRecap && S.phase==="app"){ S.openRecap = false; S.view = "me"; render(); openRecap(); }
  if (S.pendingView && S.admin && S.phase==="app"){ S.view = S.pendingView; S.forceForm = true; render(); }
  document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState==="visible" && S.phase==="app"){ try { await syncChanges(); render(); } catch {} }
  });
}
boot();
})();
