import { useState, useCallback, useRef, useEffect } from "react";

const APP_VERSION = "0.8.0";

// ─────────────────────────────────────────────────────────────────────────────
// CHANGELOG
// ─────────────────────────────────────────────────────────────────────────────
const CHANGELOG = [
  {
    version: "0.8.0", date: "2026-05-21",
    changes: [
      "DevKit v1.2: Confirm bubble after Inspect — shows element name with Log Only / Open in Map options",
      "DevKit v1.2: Self-regenerating code map — scans live DOM and scripts on every panel open, never stale",
      "DevKit v1.2: Resolve/reopen workflow in Entries tab — Open / Resolved / All filter chips",
      "DevKit v1.2: Nav event log in State tab — last 8 screen transitions with timestamps",
      "DevKit v1.2: Entry editing — tap edit icon to update message inline",
      "DevKit v1.2: Mouse + touch fallback for Inspect — works on desktop alongside mobile",
      "DevKit v1.2: State tab live-polls every 2s when panel is open",
      "DevKit v1.2: → Claude tab includes live code map summary and function count",
    ],
  },
  {
    version: "0.7.0", date: "2026-05-11",
    changes: [
      "Date Planner: What/Where/How/When axis picker replaces simple category filter",
      "Each axis has predefined generic options + ability to add your own custom options",
      "Smart spin generates a full date idea from all four axes combined",
      "Custom date axis options persist in localStorage",
      "Offer point tracking: attach earn/spend/none point transaction when creating offer",
      "Offer acceptance auto-applies point transaction to balance with history entry",
      "Counter offers allow proposing a different point value in response",
      "Point transaction shown on offer card and in task history log",
      "Gift Intel: Link field added to hint form for URL capture",
      "Gift Intel: Link renders as tappable on hint card",
    ],
  },
  {
    version: "0.6.0", date: "2026-05-11",
    changes: [
      "Her World module: full profile — name, nickname, love language, sizes, favorites, her people, notes",
      "Love language selector with plain-English descriptions of each",
      "Dev Mode toggle in Settings (hidden by default, zero impact on normal use)",
      "Dev Toolkit: Component Map — every screen and interactive element with copyable IDs",
      "Dev Toolkit: Bug Log — structured bug reports with BUG-001 IDs, severity, component ref, resolve/reopen",
      "Dev Toolkit: Session Notes — persistent scratchpad across sessions",
      "Dev Toolkit: Handoff Export — one-tap copy of open bugs + notes + data snapshot for new Claude sessions",
      "Offer links now point to jmarsh85.github.io/hw-offer — real texatable URLs",
      "herProfile added to backup export/import",
    ],
  },
  {
    version: "0.5.0", date: "2026-05-11",
    changes: [
      "Compliment Engine: full library of 50 compliments across 6 categories",
      "Daily compliment scheduler: auto-picks one per day, manual refresh with cooldown",
      "Compliment history log: last 30 delivered with date and category",
      "Custom compliment creation: write your own and save to personal library",
      "Compliment rating: mark as Delivered and rate her reaction (1–4)",
      "Reaction stats: see which categories land best based on ratings",
      "Offer web view: standalone HTML page she opens in browser — no app needed",
      "Offer web view matches Happy Wife aesthetic — warm dark premium design",
      "She can Accept, Decline, or Counter with a text response",
      "Her response encodes to a URL token she pastes back into Offers tab",
      "Offers tab: paste response token to update offer status + see her reply",
    ],
  },
  {
    version: "0.4.0", date: "2026-05-11",
    changes: [
      "Recurring tasks: weekly and monthly auto-reset with due-date tracking",
      "Task history log: last 20 completions with timestamps and points earned",
      "Bonus point multipliers: +25% without being asked, +10% same-day, +20% she noticed",
      "Streak tracker: consecutive-day completion streaks with visual flame indicator",
      "Custom reward creation: add, edit cost, and delete rewards in both For Her / For Him tabs",
      "Bonus multiplier UI on task completion — tap to apply before confirming",
      "Streak milestone toasts at 3, 7, 14, 30 days",
      "localStorage keys bumped to hw4_ prefix to avoid v0.3 stale data",
    ],
  },
  {
    version: "0.3.0", date: "2026-05-11",
    changes: [
      "Gift Intel module: hint capture with source tagging, event linking, priority, status tracking",
      "20 seed gift categories across price tiers as starting inspiration",
      "Date Night Planner: spin wheel, 40+ curated ideas across 5 categories, cost tiers",
      "Date history log with ratings, prevents recent repeats in spin",
      "Offer System: create chore-for-reward, date proposal, redemption request, and custom offers",
      "Offers encode to shareable URL token (base64) for her browser — no backend needed",
      "Offer inbox showing outbound offers and their status",
      "Smart backup nudge: prompts export after 10 changes since last backup",
      "Change counter tracking mutations across tasks, events, hints",
    ],
  },
  {
    version: "0.2.0", date: "2026-05-10",
    changes: [
      "Events module: full calendar with countdown, alert tiers, category badges",
      "Anniversary year traditions reference (Year 1–60) built in",
      "Rewards split into For Her / For Him tabs with 13 entries each",
      "Backup system: manual JSON export (.hwbackup.json) with timestamped log",
      "Import with file preview, merge mode, and replace mode",
      "In-app changelog viewer in Settings",
      "Dashboard now shows next upcoming event with urgency highlight",
    ],
  },
  {
    version: "0.1.0", date: "2026-05-10",
    changes: [
      "App shell with dark retro premium design system",
      "Dashboard: points, task count, compliment nudge, quick actions",
      "Honey-Do Hub: task list, filters, difficulty tiers, point earn/deduct",
      "Reward Store: tiered defaults, live balance check, redemption",
      "localStorage persistence, toast notifications",
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────────────────────────────────────
const DIFFICULTIES = [
  { level:1, label:"Quick",   pts:10  },
  { level:2, label:"Effort",  pts:25  },
  { level:3, label:"Project", pts:50  },
  { level:4, label:"Big",     pts:100 },
  { level:5, label:"Legend",  pts:200 },
];
const CATEGORIES = ["All","Yard","Appliance","Home Repair","Cleaning","Errands","Car","Other"];
const ANNIVERSARY_TRADITIONS = {
  1:"Paper",2:"Cotton",3:"Leather",4:"Fruit & Flowers",5:"Wood",
  6:"Candy",7:"Wool",8:"Pottery",9:"Linen",10:"Tin / Aluminum",
  11:"Steel",12:"Silk",13:"Lace",14:"Ivory",15:"Crystal",
  20:"China",25:"Silver",30:"Pearl",35:"Coral",40:"Ruby",
  45:"Sapphire",50:"Gold",55:"Emerald",60:"Diamond",
};

// ── Bonus Multipliers ─────────────────────────────────────────────────────────
const BONUSES = [
  { id:"unprompted", label:"Without Being Asked", icon:"⭐", pct:25, desc:"She didn't have to ask" },
  { id:"sameday",    label:"Same Day Completed",  icon:"⚡", pct:10, desc:"Added and done today"  },
  { id:"shenoticed", label:"She Noticed",         icon:"💕", pct:20, desc:"She mentioned it herself" },
];

// ── Gift seed categories ──────────────────────────────────────────────────────
const GIFT_SEEDS = [
  { category:"Experience", ideas:["Cooking class for two","Wine tasting","Spa day","Concert tickets","Hot air balloon ride"] },
  { category:"Home & Comfort", ideas:["Weighted blanket","Silk pillowcase set","Diffuser + essential oils","Smart coffee maker","Linen duvet upgrade"] },
  { category:"Jewelry & Accessories", ideas:["Initial necklace","Birthstone ring","Personalized bracelet","Watch","Custom name necklace"] },
  { category:"Beauty & Self-Care", ideas:["Skincare set","Perfume she mentioned","Manicure/pedicure gift card","Hair styling tools","Bath bomb collection"] },
  { category:"Fashion", ideas:["Cashmere sweater","Handbag she hinted at","Workout set","Silk robe","Boots in her style"] },
  { category:"Books & Hobbies", ideas:["Author she loves — latest release","Craft kit","Puzzle (1000+ pieces)","Journal + nice pen","Audiobook subscription"] },
  { category:"Food & Drink", ideas:["Charcuterie subscription box","Fancy chocolate assortment","Wine club membership","Gourmet coffee sampler","Restaurant gift card"] },
  { category:"Sentimental", ideas:["Custom photo book","Framed wedding photo (new print)","Custom illustration of your home","Star map of your wedding night","Anniversary keepsake box"] },
];

// ── Date Night ideas ──────────────────────────────────────────────────────────
const DATE_IDEAS = [
  { id:"d1",  name:"Upscale dinner reservation",        category:"Fancy",     cost:3, indoor:true,  desc:"Book a restaurant she's been wanting to try. Dress up." },
  { id:"d2",  name:"Hotel staycation downtown",         category:"Fancy",     cost:3, indoor:true,  desc:"One night away from home. Order room service. Sleep in." },
  { id:"d3",  name:"Private chef dinner at home",       category:"Fancy",     cost:3, indoor:true,  desc:"Book a local private chef experience. Let her be surprised." },
  { id:"d4",  name:"Rooftop cocktails + city view",     category:"Fancy",     cost:2, indoor:false, desc:"Find a rooftop bar with a view. Dress up, take your time." },
  { id:"d5",  name:"Favorite casual restaurant",        category:"Casual",    cost:2, indoor:true,  desc:"Her go-to spot. No occasion needed — just showing up." },
  { id:"d6",  name:"Brunch + farmers market stroll",    category:"Casual",    cost:1, indoor:false, desc:"Easy Sunday energy. Let her lead." },
  { id:"d7",  name:"Trivia night at a local bar",       category:"Casual",    cost:1, indoor:true,  desc:"Team effort. Competitive and fun." },
  { id:"d8",  name:"Bowling + cheap eats",              category:"Casual",    cost:1, indoor:true,  desc:"Laid-back and competitive. Winner picks dessert." },
  { id:"d9",  name:"Drive-in movie",                    category:"Casual",    cost:1, indoor:false, desc:"Bring snacks from home. Old school fun." },
  { id:"d10", name:"Food truck festival",               category:"Casual",    cost:1, indoor:false, desc:"Wander, sample, share. Low pressure." },
  { id:"d11", name:"Cook a new recipe together",        category:"At Home",   cost:1, indoor:true,  desc:"Pick something ambitious. Split the work. Wine required." },
  { id:"d12", name:"Backyard fire + s'mores",           category:"At Home",   cost:1, indoor:false, desc:"String lights, music, a blanket. Simple and perfect." },
  { id:"d13", name:"Movie marathon — her picks",        category:"At Home",   cost:1, indoor:true,  desc:"She chooses every film. No complaints from you." },
  { id:"d14", name:"Candlelit dinner you cook",         category:"At Home",   cost:1, indoor:true,  desc:"You handle everything. She shows up to a set table." },
  { id:"d15", name:"Game night — just the two of you",  category:"At Home",   cost:1, indoor:true,  desc:"Cards, board games, whatever she likes. Loser does dishes." },
  { id:"d16", name:"Spa night at home",                 category:"At Home",   cost:1, indoor:true,  desc:"You run the bath, get the face masks, give the foot rub." },
  { id:"d17", name:"Stargazing in the backyard",        category:"At Home",   cost:1, indoor:false, desc:"Blanket, pillows, phone off. Just look up." },
  { id:"d18", name:"Day hike with a picnic",            category:"Adventure", cost:1, indoor:false, desc:"Pack lunch. Find a trail. Let her set the pace." },
  { id:"d19", name:"Kayaking or paddleboarding",        category:"Adventure", cost:2, indoor:false, desc:"Book rentals for the afternoon. Sunscreen required." },
  { id:"d20", name:"Road trip — no itinerary",          category:"Adventure", cost:2, indoor:false, desc:"Drive somewhere new. Stop wherever looks interesting." },
  { id:"d21", name:"Bike ride + coffee stop",           category:"Adventure", cost:1, indoor:false, desc:"Casual pace. End at a good coffee shop." },
  { id:"d22", name:"Sunset boat ride",                  category:"Adventure", cost:2, indoor:false, desc:"Rent a pontoon or book a small charter. Bring wine." },
  { id:"d23", name:"Rock climbing gym",                 category:"Adventure", cost:1, indoor:true,  desc:"Try something new together. Cheer each other on." },
  { id:"d24", name:"Escape room",                       category:"Adventure", cost:2, indoor:true,  desc:"You'll learn a lot about each other under pressure." },
  { id:"d25", name:"Revisit your first date spot",      category:"Nostalgic", cost:2, indoor:true,  desc:"Go back to where it started. Tell her why you chose her." },
  { id:"d26", name:"Watch your wedding video together", category:"Nostalgic", cost:1, indoor:true,  desc:"Get the video out. Snacks. Tissues optional." },
  { id:"d27", name:"Cook her family's recipe",          category:"Nostalgic", cost:1, indoor:true,  desc:"Ask her mom for it. Surprise her with it." },
  { id:"d28", name:"Photo album night",                 category:"Nostalgic", cost:1, indoor:true,  desc:"Pull out old photos. Tell stories. Laugh a lot." },
  { id:"d29", name:"Recreate your first vacation",      category:"Nostalgic", cost:2, indoor:false, desc:"Even partially — the restaurant, the vibe, the feeling." },
  { id:"d30", name:"Dance to your wedding song",        category:"Nostalgic", cost:1, indoor:true,  desc:"Clear the kitchen floor. No reason needed." },
];

const DATE_CATEGORIES = ["All","Fancy","Casual","At Home","Adventure","Nostalgic"];
const COST_LABELS = { 1:"$", 2:"$$", 3:"$$$" };

// ── Date Night Axis Picker (What/Where/How/When) ──────────────────────────────
const DEFAULT_DATE_AXES = {
  what: [
    "Dinner out","Cook together","Drinks & conversation","Movie night","Game night",
    "Live music","Comedy show","Dancing","Spa / self-care","An experience",
    "Exploring somewhere new","A drive with no destination",
  ],
  where: [
    "At home","In our backyard","Downtown","A new neighborhood","Her favorite spot",
    "Somewhere neither of us has been","A hotel","Outdoors / nature","A rooftop",
  ],
  how: [
    "Low-key & easy","A little dressed up","Full date mode — dress up","Spontaneous — plan nothing",
    "Budget-friendly","Pull out all the stops","Kid-free","Completely phone-free",
  ],
  when: [
    "Tonight","This weekend","Next week — plan ahead","A random weeknight",
    "Sunday morning / brunch","Late night after she's had a tough week","On her next day off",
  ],
};

// ── Offer types ───────────────────────────────────────────────────────────────
const OFFER_TYPES = [
  { id:"chore",  label:"Chore for Reward",   icon:"🛠️", desc:"I'll do a task in exchange for a reward" },
  { id:"date",   label:"Date Night Proposal", icon:"🍷", desc:"I want to take you on a date" },
  { id:"redeem", label:"Point Redemption",    icon:"🎁", desc:"I'd like to redeem my points for something" },
  { id:"custom", label:"Custom Proposal",     icon:"💬", desc:"Something I want to negotiate" },
];

// ── Default data ──────────────────────────────────────────────────────────────
const DEFAULT_EVENTS = [
  { id:1, name:"Wedding Anniversary", category:"anniversary", month:6,  day:14, isAnnual:true, startYear:2018, alertDays:[60,30,14,7,3,1], icon:"💍", notes:"Check anniversary year traditions below for gift inspiration." },
  { id:2, name:"Her Birthday",        category:"birthday",    month:3,  day:22, isAnnual:true, startYear:null, alertDays:[30,14,7,2,1],    icon:"🎂", notes:"" },
  { id:3, name:"Valentine's Day",     category:"holiday",     month:2,  day:14, isAnnual:true, startYear:null, alertDays:[30,14,7,3,1],    icon:"❤️", notes:"Book reservations early — good places fill fast." },
  { id:4, name:"Mother's Day",        category:"holiday",     month:5,  day:11, isAnnual:true, startYear:null, alertDays:[21,7,2,1],       icon:"🌸", notes:"Plan a full day off for her — no agenda." },
  { id:5, name:"Christmas",           category:"holiday",     month:12, day:25, isAnnual:true, startYear:null, alertDays:[45,30,14,7,1],   icon:"🎄", notes:"Start the gift list early. Check Gift Intel for her hints." },
  { id:6, name:"Her Mom's Birthday",  category:"birthday",    month:8,  day:3,  isAnnual:true, startYear:null, alertDays:[14,7,1],         icon:"🎁", notes:"Brownie points for remembering without a nudge." },
  { id:7, name:"Dating Anniversary",  category:"anniversary", month:9,  day:7,  isAnnual:true, startYear:2015, alertDays:[14,7,1],         icon:"🥂", notes:"The day it all started." },
];

const TODAY_STR = new Date().toISOString().slice(0,10);

const DEFAULT_TASKS = [
  { id:1, name:"Mow the lawn",            category:"Yard",        difficulty:2, status:"pending",   pts:25,  recurring:"weekly",  lastCompleted:null, addedDate:TODAY_STR },
  { id:2, name:"Fix the bathroom faucet", category:"Appliance",   difficulty:3, status:"pending",   pts:50,  recurring:null,      lastCompleted:null, addedDate:TODAY_STR },
  { id:3, name:"Take out the trash",      category:"Cleaning",    difficulty:1, status:"completed",  pts:10,  recurring:"weekly",  lastCompleted:TODAY_STR, addedDate:TODAY_STR },
  { id:4, name:"Clean the gutters",       category:"Home Repair", difficulty:3, status:"pending",   pts:50,  recurring:null,      lastCompleted:null, addedDate:TODAY_STR },
  { id:5, name:"Wash both cars",          category:"Car",         difficulty:2, status:"pending",   pts:25,  recurring:"monthly", lastCompleted:null, addedDate:TODAY_STR },
  { id:6, name:"Pressure wash driveway",  category:"Yard",        difficulty:2, status:"pending",   pts:25,  recurring:null,      lastCompleted:null, addedDate:TODAY_STR },
  { id:7, name:"Replace AC filter",       category:"Home Repair", difficulty:1, status:"pending",   pts:10,  recurring:"monthly", lastCompleted:null, addedDate:TODAY_STR },
  { id:8, name:"Deep clean garage",       category:"Cleaning",    difficulty:4, status:"pending",   pts:100, recurring:null,      lastCompleted:null, addedDate:TODAY_STR },
];

const DEFAULT_REWARDS_HER = [
  { id:"fh1",  tier:"bronze",    icon:"🥉", name:"Foot Rub (15 min)",               cost:60,  label:"Bronze",    custom:false },
  { id:"fh2",  tier:"bronze",    icon:"🥉", name:"She Picks the Movie",             cost:50,  label:"Bronze",    custom:false },
  { id:"fh3",  tier:"bronze",    icon:"🥉", name:"Breakfast in Bed",                cost:75,  label:"Bronze",    custom:false },
  { id:"fh4",  tier:"bronze",    icon:"🥉", name:"Full Day — No Complaints",        cost:80,  label:"Bronze",    custom:false },
  { id:"fh5",  tier:"silver",    icon:"🥈", name:"Her Favorite Restaurant",         cost:175, label:"Silver",    custom:false },
  { id:"fh6",  tier:"silver",    icon:"🥈", name:"Spa Day Fund ($75)",              cost:250, label:"Silver",    custom:false },
  { id:"fh7",  tier:"silver",    icon:"🥈", name:"Shopping Trip (She Drives)",      cost:200, label:"Silver",    custom:false },
  { id:"fh8",  tier:"silver",    icon:"🥈", name:"She Picks the Vacation Activity", cost:225, label:"Silver",    custom:false },
  { id:"fh9",  tier:"gold",      icon:"🥇", name:"Full \"Yes Day\" — Her Rules",   cost:400, label:"Gold",      custom:false },
  { id:"fh10", tier:"gold",      icon:"🥇", name:"Jewelry (Up to $150)",            cost:450, label:"Gold",      custom:false },
  { id:"fh11", tier:"gold",      icon:"🥇", name:"Weekend Getaway — He Plans All",  cost:600, label:"Gold",      custom:false },
  { id:"fh12", tier:"legendary", icon:"💎", name:"Romantic Trip — Surprise Dest.",  cost:900, label:"Legendary", custom:false },
  { id:"fh13", tier:"legendary", icon:"💎", name:"She Redesigns One Room",          cost:800, label:"Legendary", custom:false },
];

const DEFAULT_REWARDS_HIM = [
  { id:"fm1",  tier:"bronze",    icon:"🥉", name:"He Picks the Movie",              cost:50,  label:"Bronze",    custom:false },
  { id:"fm2",  tier:"bronze",    icon:"🥉", name:"Sleep In — No Interruptions",     cost:60,  label:"Bronze",    custom:false },
  { id:"fm3",  tier:"bronze",    icon:"🥉", name:"His Favorite Meal, Cooked",       cost:75,  label:"Bronze",    custom:false },
  { id:"fm4",  tier:"bronze",    icon:"🥉", name:"Boys Night — No Guilt",           cost:80,  label:"Bronze",    custom:false },
  { id:"fm5",  tier:"silver",    icon:"🥈", name:"His Favorite Restaurant",         cost:175, label:"Silver",    custom:false },
  { id:"fm6",  tier:"silver",    icon:"🥈", name:"Golf Day — He Books It",          cost:200, label:"Silver",    custom:false },
  { id:"fm7",  tier:"silver",    icon:"🥈", name:"She Plans Date Night",            cost:225, label:"Silver",    custom:false },
  { id:"fm8",  tier:"silver",    icon:"🥈", name:"Sports Event of His Choice",      cost:250, label:"Silver",    custom:false },
  { id:"fm9",  tier:"gold",      icon:"🥇", name:"Full \"Yes Day\" — His Rules",   cost:400, label:"Gold",      custom:false },
  { id:"fm10", tier:"gold",      icon:"🥇", name:"Fantasy Sports Buy-In",           cost:350, label:"Gold",      custom:false },
  { id:"fm11", tier:"gold",      icon:"🥇", name:"Weekend Guy Trip — Approved",     cost:500, label:"Gold",      custom:false },
  { id:"fm12", tier:"legendary", icon:"💎", name:"He Buys the Thing He Wants",      cost:750, label:"Legendary", custom:false },
  { id:"fm13", tier:"legendary", icon:"💎", name:"Man Cave Upgrade Budget",         cost:900, label:"Legendary", custom:false },
];

// ── Compliment Library (50 entries, 6 categories) ────────────────────────────
const COMPLIMENT_LIBRARY = [
  // Appearance
  { id:"c01", cat:"Appearance",    text:"Tell her she looks beautiful today — not just pretty, beautiful." },
  { id:"c02", cat:"Appearance",    text:"Tell her you still find her more attractive than the day you met." },
  { id:"c03", cat:"Appearance",    text:"Notice something specific she did with her hair or outfit and say it out loud." },
  { id:"c04", cat:"Appearance",    text:"Tell her she has the most beautiful smile you've ever seen." },
  { id:"c05", cat:"Appearance",    text:"Let her know she looked stunning when she walked in the room." },
  { id:"c06", cat:"Appearance",    text:"Tell her she doesn't look a day older than when you first met — mean it." },
  { id:"c07", cat:"Appearance",    text:"Tell her that her laugh is your favorite sound." },
  { id:"c08", cat:"Appearance",    text:"Notice something small — the way she's wearing her hair, a new lipstick — and say you love it." },
  // Effort & Work
  { id:"c09", cat:"Effort",        text:"Tell her you noticed how hard she worked this week without her having to say a word." },
  { id:"c10", cat:"Effort",        text:"Thank her for something specific she handled that you know wasn't easy." },
  { id:"c11", cat:"Effort",        text:"Let her know you see everything she does that goes unnoticed." },
  { id:"c12", cat:"Effort",        text:"Tell her you don't know how she manages to do everything she does." },
  { id:"c13", cat:"Effort",        text:"Acknowledge one thing she did this week that made your life easier." },
  { id:"c14", cat:"Effort",        text:"Tell her the house / home / family runs because of her — and mean it." },
  { id:"c15", cat:"Effort",        text:"Thank her for handling something you forgot, without making you feel bad about it." },
  { id:"c16", cat:"Effort",        text:"Tell her she carries more than anyone realizes, and you're grateful every day." },
  // Character & Personality
  { id:"c17", cat:"Character",     text:"Tell her one thing you genuinely admire about who she is as a person." },
  { id:"c18", cat:"Character",     text:"Tell her she is one of the most thoughtful people you have ever known." },
  { id:"c19", cat:"Character",     text:"Let her know that her kindness is something you hope your kids inherit." },
  { id:"c20", cat:"Character",     text:"Tell her you are consistently in awe of how gracefully she handles hard things." },
  { id:"c21", cat:"Character",     text:"Tell her she makes everyone around her better — including you." },
  { id:"c22", cat:"Character",     text:"Let her know you love who you are when you're around her." },
  { id:"c23", cat:"Character",     text:"Tell her that her instincts are almost always right — and you should trust them more." },
  { id:"c24", cat:"Character",     text:"Tell her you fell for her brain first — and you'd fall again today." },
  // Partnership & Marriage
  { id:"c25", cat:"Partnership",   text:"Tell her she's a great partner — and describe one specific way she shows it." },
  { id:"c26", cat:"Partnership",   text:"Let her know you're proud of her — for something real and recent." },
  { id:"c27", cat:"Partnership",   text:"Tell her that marrying her is still the best decision you've ever made." },
  { id:"c28", cat:"Partnership",   text:"Tell her you're better at life because she's in it." },
  { id:"c29", cat:"Partnership",   text:"Let her know she handles disagreements better than almost anyone you know." },
  { id:"c30", cat:"Partnership",   text:"Tell her you'd choose her again — in every version of your life." },
  { id:"c31", cat:"Partnership",   text:"Let her know she makes your house feel like home." },
  { id:"c32", cat:"Partnership",   text:"Tell her that her patience with you doesn't go unnoticed." },
  // Memory & Nostalgia
  { id:"c33", cat:"Memory",        text:"Remind her of the exact moment you knew she was the one." },
  { id:"c34", cat:"Memory",        text:"Recall a small memory from early in your relationship that still makes you smile." },
  { id:"c35", cat:"Memory",        text:"Tell her about a moment you watched her and thought: I'm the luckiest man alive." },
  { id:"c36", cat:"Memory",        text:"Bring up a trip or experience you both loved — and say you want to do it again." },
  { id:"c37", cat:"Memory",        text:"Remind her of something she said years ago that you still think about." },
  { id:"c38", cat:"Memory",        text:"Tell her the story of how you fell for her — she never gets tired of it." },
  { id:"c39", cat:"Memory",        text:"Tell her about a photo of her you love and explain exactly why." },
  { id:"c40", cat:"Memory",        text:"Bring up the first time she laughed at something you said — you remember it clearly." },
  // Today / Present Moment
  { id:"c41", cat:"Present",       text:"Tell her she made you laugh today — and that you needed it." },
  { id:"c42", cat:"Present",       text:"Tell her you noticed she did something kind today without anyone asking." },
  { id:"c43", cat:"Present",       text:"Tell her that you thought about her today — while you were at work, in the car, somewhere." },
  { id:"c44", cat:"Present",       text:"Let her know today was better because she was in it." },
  { id:"c45", cat:"Present",       text:"Tell her something she said recently that you keep thinking about." },
  { id:"c46", cat:"Present",       text:"Tell her you missed her today, even if you were only apart for a few hours." },
  { id:"c47", cat:"Present",       text:"Let her know she smells amazing — she probably picked it just for you." },
  { id:"c48", cat:"Present",       text:"Tell her the way she handled something today made you really proud of her." },
  { id:"c49", cat:"Present",       text:"Tell her you love the way she talks about things she cares about." },
  { id:"c50", cat:"Present",       text:"Just say: 'I love you' — slowly, looking at her, and mean every word." },
];

const COMPLIMENT_CATS = ["All","Appearance","Effort","Character","Partnership","Memory","Present"];

// Legacy flat list for dashboard daily nudge (rotates daily)
const COMPLIMENTS = COMPLIMENT_LIBRARY.map(c=>c.text);

const TABS = [
  { id:"dashboard",  label:"Dashboard",   icon:"🏠" },
  { id:"honeydо",    label:"Honey-Do",    icon:"🛠️" },
  { id:"rewards",    label:"Rewards",     icon:"🎁" },
  { id:"events",     label:"Events",      icon:"📅" },
  { id:"dates",      label:"Dates",       icon:"🍷" },
  { id:"hints",      label:"Gift Intel",  icon:"💡" },
  { id:"compliments",label:"Compliments", icon:"💬" },
  { id:"offers",     label:"Offers",      icon:"📨" },
  { id:"herworld",   label:"Her World",   icon:"🌹" },
  { id:"settings",   label:"Settings",    icon:"⚙️" },
];

// ── Her World default profile ─────────────────────────────────────────────────
const DEFAULT_HER_PROFILE = {
  name: "",
  nickname: "",
  birthday: "",
  loveLanguage: "",
  // Sizes
  clothingSize: "", shoeSize: "", ringSize: "",
  // Preferences
  favColor: "", favFlower: "", favRestaurant: "", favDrink: "", favSnack: "",
  favMovie: "", favShow: "", favArtist: "", favBook: "",
  // People
  bestFriend: "", momName: "", dadName: "", siblingNames: "",
  // Notes
  allergies: "", dislikes: "", quirks: "", notes: "",
};

const LOVE_LANGUAGES = ["Words of Affirmation","Acts of Service","Receiving Gifts","Quality Time","Physical Touch"];

// ── Dev Toolkit component map ─────────────────────────────────────────────────
const COMPONENT_MAP = [
  { screen:"Dashboard",     components:[
    { id:"dash·points-card",      label:"Points Card" },
    { id:"dash·tasks-card",       label:"Open Tasks Card" },
    { id:"dash·event-card",       label:"Next Event Card" },
    { id:"dash·streak-card",      label:"Streak Card" },
    { id:"dash·compliment-nudge", label:"Daily Compliment Nudge" },
    { id:"dash·alert-nudge",      label:"Upcoming Event Alert" },
    { id:"dash·quick-actions",    label:"Quick Action Buttons" },
  ]},
  { screen:"Honey-Do",      components:[
    { id:"hd·streak-bar",         label:"Streak Bar" },
    { id:"hd·history-panel",      label:"Task History Panel" },
    { id:"hd·pts-banner",         label:"Points Banner" },
    { id:"hd·cat-filters",        label:"Category Filter Chips" },
    { id:"hd·rec-filters",        label:"Recurring Filter Chips" },
    { id:"hd·task-card",          label:"Task Card" },
    { id:"hd·task-card·rec-badge",label:"Recurring Badge on Task" },
    { id:"hd·task-card·due-tag",  label:"Due Date Tag on Task" },
    { id:"hd·AddTaskModal",       label:"Add Task Modal" },
    { id:"hd·AddTaskModal·diff",  label:"Difficulty Selector" },
    { id:"hd·AddTaskModal·recur", label:"Recurring Schedule Selector" },
    { id:"hd·CompleteModal",      label:"Complete Task Modal" },
    { id:"hd·CompleteModal·bonus",label:"Bonus Multiplier Options" },
  ]},
  { screen:"Rewards",       components:[
    { id:"rew·tab-toggle",        label:"For Her / For Him Toggle" },
    { id:"rew·reward-card",       label:"Reward Card" },
    { id:"rew·reward-card·redeem",label:"Redeem Button" },
    { id:"rew·custom-card",       label:"Custom Reward Card" },
    { id:"rew·custom-card·edit",  label:"Edit Cost Button" },
    { id:"rew·custom-card·del",   label:"Remove Button" },
    { id:"rew·AddRewardModal",    label:"Add Custom Reward Modal" },
    { id:"rew·AddRewardModal·icon",label:"Icon Picker" },
  ]},
  { screen:"Events",        components:[
    { id:"evt·event-card",        label:"Event Card" },
    { id:"evt·event-card·alerts", label:"Alert Day Chips" },
    { id:"evt·event-card·trad",   label:"Anniversary Tradition Row" },
    { id:"evt·traditions-panel",  label:"Anniversary Traditions Panel" },
    { id:"evt·AddEventModal",     label:"Add Event Modal" },
  ]},
  { screen:"Dates",         components:[
    { id:"dt·spin-btn",           label:"Spin Button" },
    { id:"dt·spin-result",        label:"Spin Result Card" },
    { id:"dt·cat-filters",        label:"Category Filter Chips" },
    { id:"dt·date-history",       label:"Date History List" },
    { id:"dt·browse-list",        label:"Browse All List" },
  ]},
  { screen:"Gift Intel",    components:[
    { id:"gi·hint-card",          label:"Hint Card" },
    { id:"gi·hint-card·status",   label:"Status Cycle Button" },
    { id:"gi·hint-card·pri",      label:"Priority Dot" },
    { id:"gi·status-filters",     label:"Status Filter Chips" },
    { id:"gi·seeds-grid",         label:"Inspiration Seeds Grid" },
    { id:"gi·AddHintModal",       label:"Add Hint Modal" },
  ]},
  { screen:"Compliments",   components:[
    { id:"cp·daily-card",         label:"Daily Compliment Card" },
    { id:"cp·daily-card·deliver", label:"Mark Delivered Button" },
    { id:"cp·daily-card·refresh", label:"New One Button" },
    { id:"cp·reaction-picker",    label:"Reaction Picker (emoji)" },
    { id:"cp·library-list",       label:"Library List" },
    { id:"cp·history-list",       label:"History List" },
    { id:"cp·stats-bars",         label:"Category Stats Bars" },
    { id:"cp·AddCustomModal",     label:"Add Custom Compliment Box" },
  ]},
  { screen:"Offers",        components:[
    { id:"off·paste-box",         label:"Response Token Paste Box" },
    { id:"off·offer-card",        label:"Offer Card" },
    { id:"off·offer-card·link",   label:"Offer Link Token Box" },
    { id:"off·CreateModal",       label:"Create Offer Modal" },
    { id:"off·CreateModal·type",  label:"Offer Type Selector" },
  ]},
  { screen:"Her World",     components:[
    { id:"hw·profile-section",    label:"Profile & Identity Section" },
    { id:"hw·sizes-section",      label:"Sizes Section" },
    { id:"hw·prefs-section",      label:"Preferences Section" },
    { id:"hw·people-section",     label:"Her People Section" },
    { id:"hw·notes-section",      label:"Notes & Quirks Section" },
  ]},
  { screen:"Settings",      components:[
    { id:"set·backup-nudge",      label:"Backup Nudge Banner" },
    { id:"set·export-btn",        label:"Export Backup Button" },
    { id:"set·import-btn",        label:"Import Backup Button" },
    { id:"set·changelog",         label:"Changelog Panel" },
    { id:"set·devmode-toggle",    label:"Dev Mode Toggle" },
  ]},
  { screen:"Dev Toolkit",   components:[
    { id:"dev·component-map",     label:"Component Map" },
    { id:"dev·bug-form",          label:"Bug Report Form" },
    { id:"dev·bug-log",           label:"Bug Log" },
    { id:"dev·session-notes",     label:"Session Notes Scratchpad" },
    { id:"dev·handoff-export",    label:"Handoff Export Button" },
  ]},
];

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const Styles = () => (
  <style>{`
    /* Fonts loaded via index.html link tag for Vite compatibility */
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --bg:#0c0a08;--surface:#161210;--surface2:#1f1a14;--surface3:#2a231a;
      --gold:#c9a84c;--gold-dim:#8a6f2e;--gold-glow:rgba(201,168,76,0.15);
      --red:#c0392b;
      --rose-bg:rgba(139,34,82,0.18);--rose-bd:rgba(139,34,82,0.3);--rose-tx:#d4a0b8;
      --blue-bg:rgba(74,144,184,0.15);--blue-bd:rgba(74,144,184,0.28);--blue-tx:#90bcd8;
      --green-bg:rgba(74,124,89,0.15);--green-bd:rgba(74,124,89,0.3);--green-tx:#7ab88a;
      --amber-bg:rgba(210,140,40,0.15);--amber-bd:rgba(210,140,40,0.3);--amber-tx:#d4a060;
      --cream:#f0e6d3;--cream-dim:#a8967e;--muted:#5a4d3a;
      --border:rgba(201,168,76,0.18);--border2:rgba(201,168,76,0.08);
      --fd:'Playfair Display',serif;--fb:'Crimson Pro',serif;--fm:'DM Mono',monospace;
      --r:6px;
    }
    html,body,#root{height:100%;background:var(--bg)}
    .app{min-height:100vh;background:var(--bg);background-image:radial-gradient(ellipse 80% 50% at 50% -10%,rgba(201,168,76,.06) 0%,transparent 70%);color:var(--cream);font-family:var(--fb);font-size:16px;display:flex;flex-direction:column;max-width:480px;margin:0 auto}
    .hdr{padding:15px 19px 12px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border2);position:sticky;top:0;z-index:100;background:rgba(12,10,8,.95);backdrop-filter:blur(12px)}
    .hdr-brand{display:flex;align-items:baseline;gap:8px}
    .hdr-title{font-family:var(--fd);font-size:20px;font-weight:700;color:var(--gold);letter-spacing:.02em}
    .hdr-sub{font-size:10px;color:var(--muted);letter-spacing:.12em;text-transform:uppercase;font-family:var(--fm)}
    .pts-badge{display:flex;flex-direction:column;align-items:flex-end}
    .pts-val{font-family:var(--fd);font-size:22px;font-weight:600;color:var(--gold);line-height:1}
    .pts-lbl{font-size:10px;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;font-family:var(--fm)}
    .nav{display:flex;background:var(--surface);border-bottom:1px solid var(--border2);overflow-x:auto;scrollbar-width:none}
    .nav::-webkit-scrollbar{display:none}
    .nbtn{flex:0 0 auto;padding:10px 12px;font-family:var(--fm);font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);background:none;border:none;cursor:pointer;white-space:nowrap;border-bottom:2px solid transparent;transition:all .2s;display:flex;align-items:center;gap:4px}
    .nbtn:hover{color:var(--cream-dim)}
    .nbtn.active{color:var(--gold);border-bottom-color:var(--gold)}
    .main{flex:1;padding:17px 15px 100px;overflow-y:auto}
    .sec-hdr{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:13px}
    .sec-title{font-family:var(--fd);font-size:20px;font-weight:600;color:var(--cream)}
    .sec-title span{color:var(--gold);font-style:italic}
    .sec-act{font-family:var(--fm);font-size:10px;color:var(--gold-dim);letter-spacing:.08em;text-transform:uppercase;background:none;border:none;cursor:pointer;transition:color .2s}
    .sec-act:hover{color:var(--gold)}
    .sub-lbl{font-family:var(--fm);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--gold-dim);margin-bottom:9px}
    .divider{height:1px;background:var(--border2);margin:17px 0}
    .card{background:var(--surface);border:1px solid var(--border2);border-radius:var(--r);padding:12px 14px;position:relative;overflow:hidden}
    .card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--gold-dim),transparent);opacity:.4}
    /* Dashboard */
    .greet{margin-bottom:18px}
    .greet-sub{font-size:11px;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;font-family:var(--fm);margin-bottom:3px}
    .greet-main{font-family:var(--fd);font-size:23px;font-weight:600;color:var(--cream);font-style:italic}
    .greet-main span{color:var(--gold)}
    .dgrid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:13px}
    .dcard{background:var(--surface);border:1px solid var(--border2);border-radius:var(--r);padding:12px;position:relative;overflow:hidden}
    .dcard::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--gold-dim),transparent);opacity:.35}
    .dcard-lbl{font-size:10px;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;font-family:var(--fm);margin-bottom:4px}
    .dcard-val{font-family:var(--fd);font-size:25px;font-weight:700;color:var(--gold);line-height:1}
    .dcard-sub{font-size:12px;color:var(--cream-dim);margin-top:3px}
    .dcard.urge{border-color:rgba(192,57,43,.35)}
    .dcard.urge .dcard-val{color:var(--red)}
    .dcard.streak{border-color:rgba(210,140,40,.3)}
    .nudge{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:13px 16px;margin-bottom:12px}
    .nudge-icon{font-size:16px;margin-bottom:5px}
    .nudge-lbl{font-size:10px;color:var(--gold-dim);letter-spacing:.12em;text-transform:uppercase;font-family:var(--fm);margin-bottom:4px}
    .nudge-txt{font-family:var(--fd);font-size:15px;font-style:italic;color:var(--cream);line-height:1.5}
    .nudge-btn{margin-top:9px;padding:5px 12px;background:none;border:1px solid var(--gold-dim);border-radius:var(--r);color:var(--gold);font-family:var(--fm);font-size:10px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:all .2s}
    .nudge-btn:hover{background:var(--gold-glow)}
    .nudge.alert{border-color:rgba(192,57,43,.4)}
    .nudge.alert .nudge-lbl{color:var(--red)}
    .qactions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:13px}
    .qbtn{background:var(--surface2);border:1px solid var(--border2);border-radius:var(--r);padding:12px;color:var(--cream-dim);font-family:var(--fm);font-size:10px;letter-spacing:.07em;text-transform:uppercase;cursor:pointer;text-align:center;transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:4px}
    .qbtn:hover{border-color:var(--gold-dim);color:var(--gold);background:var(--gold-glow)}
    .qicon{font-size:18px}
    /* Honey-Do */
    .pts-banner{background:linear-gradient(135deg,var(--surface2),var(--surface3));border:1px solid var(--border);border-radius:var(--r);padding:12px 16px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between}
    .pts-big{font-family:var(--fd);font-size:32px;font-weight:700;color:var(--gold);line-height:1}
    .pts-lbl2{font-size:10px;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;font-family:var(--fm);margin-top:2px}
    .pts-bar{height:3px;background:var(--surface3);border-radius:2px;margin-top:8px;overflow:hidden;width:120px}
    .pts-fill{height:100%;background:linear-gradient(90deg,var(--gold-dim),var(--gold));border-radius:2px;transition:width .6s ease}
    .filters{display:flex;gap:6px;margin-bottom:12px;overflow-x:auto;scrollbar-width:none}
    .filters::-webkit-scrollbar{display:none}
    .chip{flex:0 0 auto;padding:4px 10px;border-radius:20px;font-family:var(--fm);font-size:9px;letter-spacing:.07em;text-transform:uppercase;border:1px solid var(--border2);background:none;color:var(--muted);cursor:pointer;transition:all .2s}
    .chip.on{background:var(--gold-glow);border-color:var(--gold-dim);color:var(--gold)}
    .tlist{display:flex;flex-direction:column;gap:8px}
    .tcard{background:var(--surface);border:1px solid var(--border2);border-radius:var(--r);padding:11px 13px;display:flex;align-items:flex-start;gap:10px;transition:all .2s;cursor:pointer}
    .tcard:hover{border-color:var(--gold-dim);background:var(--surface2)}
    .tcard.done{opacity:.5}
    .tcard.done .tname{text-decoration:line-through;color:var(--muted)}
    .tcard.due-soon{border-color:rgba(210,140,40,.3)}
    .tcheck{width:19px;height:19px;border-radius:50%;border:1.5px solid var(--gold-dim);flex-shrink:0;margin-top:2px;display:flex;align-items:center;justify-content:center;font-size:10px;color:transparent;transition:all .2s}
    .tcard.done .tcheck{background:var(--gold-dim);color:var(--bg);border-color:var(--gold-dim)}
    .tbody{flex:1;min-width:0}
    .tname{font-size:15px;font-weight:600;color:var(--cream);margin-bottom:2px}
    .tmeta{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
    .tcat{font-family:var(--fm);font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
    .tdots{display:flex;gap:2px}
    .dot{width:5px;height:5px;border-radius:50%;background:var(--muted)}
    .dot.on{background:var(--gold-dim)}
    .tpts{font-family:var(--fd);font-size:15px;font-weight:600;color:var(--gold)}
    .tpts-lbl{font-family:var(--fm);font-size:9px;color:var(--muted);text-transform:uppercase}
    .rec-badge{padding:2px 6px;border-radius:10px;font-family:var(--fm);font-size:9px;letter-spacing:.05em;text-transform:uppercase}
    .rec-weekly{background:rgba(74,144,184,.12);border:1px solid rgba(74,144,184,.25);color:#90bcd8}
    .rec-monthly{background:rgba(74,124,89,.12);border:1px solid rgba(74,124,89,.25);color:#7ab88a}
    /* Streak */
    .streak-bar{background:linear-gradient(135deg,var(--surface2),var(--surface3));border:1px solid rgba(210,140,40,.3);border-radius:var(--r);padding:12px 16px;margin-bottom:14px;display:flex;align-items:center;gap:14px}
    .streak-flame{font-size:28px;line-height:1;filter:drop-shadow(0 0 6px rgba(210,140,40,.5))}
    .streak-info{flex:1}
    .streak-num{font-family:var(--fd);font-size:28px;font-weight:700;color:var(--amber-tx);line-height:1}
    .streak-lbl{font-family:var(--fm);font-size:10px;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;margin-top:2px}
    .streak-best{font-size:12px;color:var(--muted);margin-top:2px;font-family:var(--fm)}
    /* Bonus picker */
    .bonus-picker{background:var(--surface2);border:1px solid var(--border);border-radius:var(--r);padding:11px 13px;margin-bottom:8px}
    .bonus-title{font-family:var(--fm);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--gold-dim);margin-bottom:8px}
    .bonus-opts{display:flex;flex-direction:column;gap:6px}
    .bonus-opt{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:var(--r);border:1px solid var(--border2);cursor:pointer;transition:all .2s;background:none}
    .bonus-opt.on{border-color:var(--amber-bd);background:var(--amber-bg)}
    .bonus-opt-icon{font-size:15px;flex-shrink:0}
    .bonus-opt-body{flex:1;min-width:0;text-align:left}
    .bonus-opt-lbl{font-size:13px;color:var(--cream);font-weight:600}
    .bonus-opt-desc{font-size:11px;color:var(--muted);font-family:var(--fm)}
    .bonus-opt-pct{font-family:var(--fd);font-size:14px;font-weight:700;color:var(--amber-tx)}
    .bonus-total{display:flex;justify-content:space-between;align-items:center;margin-top:9px;padding-top:9px;border-top:1px solid var(--border2)}
    .bonus-total-lbl{font-family:var(--fm);font-size:10px;color:var(--muted);letter-spacing:.08em;text-transform:uppercase}
    .bonus-total-pts{font-family:var(--fd);font-size:19px;font-weight:700;color:var(--gold)}
    /* Task History */
    .hist-item{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--border2);font-size:13px}
    .hist-item:last-child{border-bottom:none}
    .hist-name{color:var(--cream-dim);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .hist-meta{display:flex;gap:8px;align-items:center;flex-shrink:0}
    .hist-pts{font-family:var(--fd);font-size:13px;color:var(--gold)}
    .hist-date{font-family:var(--fm);font-size:9px;color:var(--muted);letter-spacing:.04em}
    /* Rewards */
    .rtoggle{display:flex;background:var(--surface2);border:1px solid var(--border2);border-radius:var(--r);padding:3px;margin-bottom:15px;gap:3px}
    .rtbtn{flex:1;padding:7px;font-family:var(--fm);font-size:10px;letter-spacing:.07em;text-transform:uppercase;border:none;border-radius:4px;cursor:pointer;transition:all .2s;background:none;color:var(--muted)}
    .rtbtn.her{background:var(--rose-bg);color:var(--rose-tx);border:1px solid var(--rose-bd)}
    .rtbtn.him{background:var(--blue-bg);color:var(--blue-tx);border:1px solid var(--blue-bd)}
    .rlist{display:flex;flex-direction:column;gap:8px}
    .rcard{background:var(--surface);border:1px solid var(--border2);border-radius:var(--r);padding:11px 13px;display:flex;align-items:center;gap:10px}
    .rcard.custom-r{border-color:rgba(74,124,89,.25)}
    .rbadge{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;border:1px solid var(--border2);background:var(--surface2)}
    .rbody{flex:1;min-width:0}
    .rname{font-size:14px;font-weight:600;color:var(--cream)}
    .rtier-lbl{font-family:var(--fm);font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-top:2px}
    .rcost{font-family:var(--fd);font-size:16px;font-weight:600;color:var(--gold)}
    .rcost-lbl{font-size:9px;color:var(--muted);font-family:var(--fm);text-transform:uppercase}
    .r-red{margin-top:5px;padding:4px 10px;background:none;border:1px solid var(--gold-dim);border-radius:4px;color:var(--gold);font-family:var(--fm);font-size:9px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:all .2s;display:block;width:100%;text-align:center}
    .r-red:hover{background:var(--gold-glow)}
    .r-red:disabled{opacity:.3;cursor:not-allowed;border-color:var(--muted);color:var(--muted)}
    .r-del{padding:4px 8px;background:none;border:1px solid rgba(192,57,43,.3);border-radius:4px;color:rgba(192,57,43,.6);font-family:var(--fm);font-size:9px;cursor:pointer;transition:all .2s;margin-top:4px;display:block;width:100%;text-align:center}
    .r-del:hover{border-color:var(--red);color:var(--red)}
    /* Events */
    .elist{display:flex;flex-direction:column;gap:9px}
    .ecard{background:var(--surface);border:1px solid var(--border2);border-radius:var(--r);padding:12px 14px;transition:all .2s}
    .ecard:hover{border-color:var(--gold-dim)}
    .ecard.urgent{border-color:rgba(192,57,43,.45)}
    .ecard.soon{border-color:rgba(201,168,76,.3)}
    .etop{display:flex;align-items:flex-start;gap:10px}
    .eicon{font-size:22px;flex-shrink:0}
    .ebody{flex:1;min-width:0}
    .ename{font-family:var(--fd);font-size:15px;font-weight:600;color:var(--cream)}
    .edate{font-family:var(--fm);font-size:10px;color:var(--muted);letter-spacing:.06em;margin-top:2px;text-transform:uppercase}
    .ecount{text-align:right;flex-shrink:0}
    .edays{font-family:var(--fd);font-size:25px;font-weight:700;color:var(--gold);line-height:1}
    .edays.urg{color:var(--red)}
    .edays-lbl{font-family:var(--fm);font-size:9px;color:var(--muted);letter-spacing:.06em;text-transform:uppercase}
    .emeta{display:flex;align-items:center;gap:6px;margin-top:8px;flex-wrap:wrap}
    .ebadge{padding:2px 8px;border-radius:12px;font-family:var(--fm);font-size:9px;letter-spacing:.07em;text-transform:uppercase}
    .eb-ann{background:rgba(139,34,82,.2);color:#c48aaa;border:1px solid rgba(139,34,82,.3)}
    .eb-bday{background:var(--blue-bg);color:var(--blue-tx);border:1px solid var(--blue-bd)}
    .eb-hol{background:var(--gold-glow);color:var(--gold-dim);border:1px solid var(--border)}
    .eb-cust{background:var(--green-bg);color:var(--green-tx);border:1px solid var(--green-bd)}
    .etrad{margin-top:7px;padding:6px 10px;background:var(--surface2);border-radius:4px;font-size:13px;font-style:italic;color:var(--cream-dim)}
    .ealerts{margin-top:6px;display:flex;gap:4px;flex-wrap:wrap}
    .achip{padding:2px 6px;border-radius:10px;font-family:var(--fm);font-size:9px;color:var(--muted);border:1px solid var(--border2)}
    .achip.fired{border-color:var(--gold-dim);color:var(--gold-dim)}
    .enotes{margin-top:6px;font-size:13px;color:var(--muted);font-style:italic;line-height:1.4}
    /* Date Night */
    .spin-area{display:flex;flex-direction:column;align-items:center;padding:20px 0 16px;gap:12px}
    .spin-btn{padding:14px 32px;background:linear-gradient(135deg,var(--gold-dim),var(--gold));border:none;border-radius:30px;color:var(--bg);font-family:var(--fm);font-size:13px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:all .3s;font-weight:400}
    .spin-btn:hover{transform:scale(1.04);box-shadow:0 0 24px rgba(201,168,76,.35)}
    .spin-btn:active{transform:scale(.98)}
    .spin-result{width:100%;background:linear-gradient(135deg,var(--surface2),var(--surface3));border:1px solid var(--border);border-radius:var(--r);padding:16px 18px;animation:fadein .4s ease}
    @keyframes fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    .sr-cat{font-family:var(--fm);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--gold-dim);margin-bottom:5px}
    .sr-name{font-family:var(--fd);font-size:19px;font-weight:600;color:var(--cream);margin-bottom:6px}
    .sr-desc{font-size:14px;color:var(--cream-dim);line-height:1.5;font-style:italic;margin-bottom:10px}
    .sr-meta{display:flex;gap:8px;align-items:center}
    .sr-cost{font-family:var(--fm);font-size:11px;color:var(--gold);letter-spacing:.06em}
    .sr-indoor{font-family:var(--fm);font-size:11px;color:var(--muted)}
    .sr-actions{display:flex;gap:8px;margin-top:12px}
    .date-list{display:flex;flex-direction:column;gap:8px;margin-top:4px}
    .date-card{background:var(--surface);border:1px solid var(--border2);border-radius:var(--r);padding:11px 13px;display:flex;align-items:flex-start;gap:10px;cursor:pointer;transition:all .2s}
    .date-card:hover{border-color:var(--gold-dim);background:var(--surface2)}
    .date-cat-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:6px}
    .date-body{flex:1;min-width:0}
    .date-name{font-size:14px;font-weight:600;color:var(--cream);margin-bottom:2px}
    .date-meta{font-family:var(--fm);font-size:9px;color:var(--muted);letter-spacing:.06em;text-transform:uppercase}
    /* Gift Intel */
    .hint-list{display:flex;flex-direction:column;gap:8px}
    .hint-card{background:var(--surface);border:1px solid var(--border2);border-radius:var(--r);padding:11px 13px;display:flex;align-items:flex-start;gap:10px;transition:all .2s}
    .hint-card:hover{border-color:var(--gold-dim)}
    .hint-pri{width:6px;height:6px;border-radius:50%;flex-shrink:0;margin-top:7px}
    .hint-pri.high{background:#c0392b}
    .hint-pri.med{background:var(--gold)}
    .hint-pri.low{background:var(--muted)}
    .hint-body{flex:1;min-width:0}
    .hint-name{font-size:14px;font-weight:600;color:var(--cream);margin-bottom:3px}
    .hint-meta{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
    .hint-tag{padding:2px 7px;border-radius:10px;font-family:var(--fm);font-size:9px;letter-spacing:.06em;text-transform:uppercase}
    .ht-source{background:var(--surface2);border:1px solid var(--border2);color:var(--muted)}
    .ht-price{background:var(--gold-glow);border:1px solid var(--border);color:var(--gold-dim)}
    .ht-event{background:var(--rose-bg);border:1px solid var(--rose-bd);color:var(--rose-tx)}
    .ht-idea{background:var(--green-bg);border:1px solid var(--green-bd);color:var(--green-tx)}
    .hint-status-btn{padding:3px 9px;border-radius:10px;font-family:var(--fm);font-size:9px;letter-spacing:.06em;text-transform:uppercase;border:none;cursor:pointer;transition:all .2s}
    .hs-active{background:var(--amber-bg);border:1px solid var(--amber-bd);color:var(--amber-tx)}
    .hs-bought{background:var(--green-bg);border:1px solid var(--green-bd);color:var(--green-tx)}
    .hs-given{background:var(--surface2);border:1px solid var(--border2);color:var(--muted)}
    .seeds-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px}
    .seed-card{background:var(--surface2);border:1px solid var(--border2);border-radius:var(--r);padding:10px 12px;cursor:pointer;transition:all .2s}
    .seed-card:hover{border-color:var(--gold-dim);background:var(--surface3)}
    .seed-cat{font-family:var(--fm);font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:var(--gold-dim);margin-bottom:5px}
    .seed-item{font-size:12px;color:var(--cream-dim);margin-bottom:2px;padding-left:8px;position:relative}
    .seed-item::before{content:'·';position:absolute;left:0;color:var(--muted)}
    /* Offers */
    .offer-types{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px}
    .offer-type-btn{background:var(--surface2);border:1px solid var(--border2);border-radius:var(--r);padding:12px;cursor:pointer;transition:all .2s;text-align:left}
    .offer-type-btn:hover{border-color:var(--gold-dim);background:var(--surface3)}
    .offer-type-btn.sel{border-color:var(--gold-dim);background:var(--gold-glow)}
    .offer-type-icon{font-size:20px;margin-bottom:5px}
    .offer-type-lbl{font-family:var(--fm);font-size:10px;letter-spacing:.07em;text-transform:uppercase;color:var(--gold-dim);margin-bottom:3px}
    .offer-type-desc{font-size:12px;color:var(--muted);line-height:1.3}
    .offer-card{background:var(--surface);border:1px solid var(--border2);border-radius:var(--r);padding:12px 14px;margin-bottom:8px;transition:all .2s}
    .offer-card:hover{border-color:var(--gold-dim)}
    .offer-top{display:flex;align-items:flex-start;gap:10px}
    .offer-icon{font-size:20px;flex-shrink:0}
    .offer-body{flex:1;min-width:0}
    .offer-title{font-size:14px;font-weight:600;color:var(--cream);margin-bottom:3px}
    .offer-msg{font-size:13px;color:var(--cream-dim);font-style:italic;line-height:1.4;margin-bottom:6px}
    .offer-meta{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
    .offer-status{padding:3px 9px;border-radius:10px;font-family:var(--fm);font-size:9px;letter-spacing:.06em;text-transform:uppercase}
    .os-pending{background:var(--amber-bg);border:1px solid var(--amber-bd);color:var(--amber-tx)}
    .os-accepted{background:var(--green-bg);border:1px solid var(--green-bd);color:var(--green-tx)}
    .os-declined{background:rgba(192,57,43,.15);border:1px solid rgba(192,57,43,.3);color:#e07070}
    .os-countered{background:var(--blue-bg);border:1px solid var(--blue-bd);color:var(--blue-tx)}
    .token-box{background:var(--surface3);border:1px solid var(--border);border-radius:var(--r);padding:10px 12px;margin-top:10px}
    .token-lbl{font-family:var(--fm);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--gold-dim);margin-bottom:5px}
    .token-val{font-family:var(--fm);font-size:10px;color:var(--cream-dim);word-break:break-all;line-height:1.5}
    .token-actions{display:flex;gap:7px;margin-top:8px}
    /* Settings */
    .sset-title{font-family:var(--fd);font-size:17px;font-weight:600;color:var(--cream);margin-bottom:10px}
    .blog{padding:10px 12px;background:var(--surface2);border:1px solid var(--border2);border-radius:var(--r);margin-bottom:11px}
    .blog-title{font-family:var(--fm);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--gold-dim);margin-bottom:6px}
    .blog-row{display:flex;justify-content:space-between;font-size:12px;color:var(--cream-dim);margin-bottom:3px;font-family:var(--fm)}
    .blog-row span{color:var(--muted)}
    .cl-entry{margin-bottom:16px}
    .cl-ver{font-family:var(--fd);font-size:16px;font-weight:600;color:var(--gold)}
    .cl-date{font-family:var(--fm);font-size:10px;color:var(--muted);letter-spacing:.06em;margin-bottom:6px;margin-top:2px}
    .cl-item{font-size:13px;color:var(--cream-dim);padding:3px 0 3px 10px;border-left:2px solid var(--border);margin-bottom:2px;line-height:1.4}
    .vfooter{text-align:center;padding:10px 0 0;font-family:var(--fm);font-size:10px;color:var(--muted);letter-spacing:.08em}
    /* Modal */
    .overlay{position:fixed;inset:0;background:rgba(0,0,0,.8);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:flex-end;justify-content:center}
    .modal{background:var(--surface);border:1px solid var(--border);border-bottom:none;border-radius:12px 12px 0 0;padding:19px 16px 32px;width:100%;max-width:480px;animation:up .28s ease;max-height:90vh;overflow-y:auto}
    @keyframes up{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
    .mhandle{width:34px;height:3px;background:var(--muted);border-radius:2px;margin:0 auto 16px}
    .mtitle{font-family:var(--fd);font-size:18px;font-weight:600;color:var(--cream);margin-bottom:15px}
    .fgrp{margin-bottom:12px}
    .flbl{display:block;font-family:var(--fm);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:5px}
    .finp{width:100%;background:var(--surface2);border:1px solid var(--border2);border-radius:var(--r);padding:8px 11px;color:var(--cream);font-family:var(--fb);font-size:15px;outline:none;transition:border-color .2s}
    .finp:focus{border-color:var(--gold-dim)}
    .finp option{background:var(--surface2)}
    .ftxt{width:100%;background:var(--surface2);border:1px solid var(--border2);border-radius:var(--r);padding:8px 11px;color:var(--cream);font-family:var(--fb);font-size:14px;outline:none;transition:border-color .2s;resize:none;min-height:62px}
    .ftxt:focus{border-color:var(--gold-dim)}
    .diffs{display:flex;gap:5px}
    .dopt{flex:1;padding:8px 3px;background:var(--surface2);border:1px solid var(--border2);border-radius:var(--r);color:var(--muted);font-family:var(--fm);font-size:9px;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;text-align:center;transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:3px}
    .dopt.on{border-color:var(--gold-dim);color:var(--gold);background:var(--gold-glow)}
    .dopt-pts{font-family:var(--fd);font-size:14px;font-weight:700}
    .macts{display:flex;gap:8px;margin-top:16px}
    .btn-p{flex:1;padding:11px;background:var(--gold);border:none;border-radius:var(--r);color:var(--bg);font-family:var(--fm);font-size:11px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:all .2s}
    .btn-p:hover{background:#d4b05c}
    .btn-p:disabled{opacity:.35;cursor:not-allowed}
    .btn-s{padding:11px 16px;background:none;border:1px solid var(--border2);border-radius:var(--r);color:var(--muted);font-family:var(--fm);font-size:11px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:all .2s}
    .btn-s:hover{border-color:var(--muted);color:var(--cream-dim)}
    .btn-f{width:100%;padding:10px;border-radius:var(--r);font-family:var(--fm);font-size:11px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:all .2s;margin-bottom:8px}
    .btn-exp{background:var(--gold-glow);border:1px solid var(--gold-dim);color:var(--gold)}
    .btn-exp:hover{background:rgba(201,168,76,.25)}
    .btn-imp{background:var(--blue-bg);border:1px solid var(--blue-bd);color:var(--blue-tx)}
    .btn-imp:hover{background:rgba(74,144,184,.25)}
    .btn-rose{background:var(--rose-bg);border:1px solid var(--rose-bd);color:var(--rose-tx)}
    .btn-rose:hover{background:rgba(139,34,82,.28)}
    .btn-green{background:var(--green-bg);border:1px solid var(--green-bd);color:var(--green-tx)}
    .btn-green:hover{background:rgba(74,124,89,.25)}
    .toast{position:fixed;bottom:84px;left:50%;transform:translateX(-50%);background:var(--surface3);border:1px solid var(--gold-dim);border-radius:30px;padding:8px 19px;font-family:var(--fm);font-size:11px;color:var(--gold);letter-spacing:.06em;z-index:300;animation:tin .3s ease,tout .4s ease 1.8s forwards;white-space:nowrap}
    @keyframes tin{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
    @keyframes tout{from{opacity:1}to{opacity:0}}
    .empty{text-align:center;padding:36px 20px}
    .empty-icon{font-size:29px;margin-bottom:8px}
    .empty-txt{font-family:var(--fd);font-size:15px;font-style:italic;color:var(--muted)}
    .prev-box{background:var(--surface2);border:1px solid var(--border2);border-radius:var(--r);padding:10px 12px;margin-bottom:12px}
    .prev-title{font-family:var(--fm);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--gold-dim);margin-bottom:6px}
    .prev-row{display:flex;justify-content:space-between;font-size:13px;color:var(--cream-dim);margin-bottom:3px}
    .prev-row strong{color:var(--cream)}
    .backup-nudge{background:rgba(210,140,40,.12);border:1px solid var(--amber-bd);border-radius:var(--r);padding:10px 13px;margin-bottom:13px;font-size:13px;color:var(--amber-tx);display:flex;align-items:center;gap:8px}
    /* Compliment Engine */
    .comp-daily{background:linear-gradient(135deg,var(--surface2),var(--surface3));border:1px solid var(--border);border-radius:var(--r);padding:16px 18px;margin-bottom:14px;position:relative;overflow:hidden}
    .comp-daily::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--rose-bd),transparent);opacity:.8}
    .comp-daily-lbl{font-family:var(--fm);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--rose-tx);margin-bottom:8px;display:flex;align-items:center;gap:6px}
    .comp-cat-pill{padding:2px 8px;border-radius:10px;font-family:var(--fm);font-size:9px;letter-spacing:.06em;text-transform:uppercase;background:var(--rose-bg);border:1px solid var(--rose-bd);color:var(--rose-tx)}
    .comp-text{font-family:var(--fd);font-size:16px;font-style:italic;color:var(--cream);line-height:1.6;margin-bottom:12px}
    .comp-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
    .comp-deliver-btn{padding:6px 14px;background:var(--rose-bg);border:1px solid var(--rose-bd);border-radius:var(--r);color:var(--rose-tx);font-family:var(--fm);font-size:10px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:all .2s}
    .comp-deliver-btn:hover{background:rgba(139,34,82,.3)}
    .comp-deliver-btn.done{background:var(--green-bg);border-color:var(--green-bd);color:var(--green-tx)}
    .comp-refresh-btn{padding:6px 12px;background:none;border:1px solid var(--border2);border-radius:var(--r);color:var(--muted);font-family:var(--fm);font-size:10px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:all .2s}
    .comp-refresh-btn:hover:not(:disabled){border-color:var(--gold-dim);color:var(--gold)}
    .comp-refresh-btn:disabled{opacity:.35;cursor:not-allowed}
    .comp-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:12px}
    .comp-stat{background:var(--surface2);border:1px solid var(--border2);border-radius:var(--r);padding:10px 8px;text-align:center}
    .comp-stat-val{font-family:var(--fd);font-size:20px;font-weight:700;color:var(--gold)}
    .comp-stat-lbl{font-family:var(--fm);font-size:9px;color:var(--muted);letter-spacing:.06em;text-transform:uppercase;margin-top:2px}
    .comp-list{display:flex;flex-direction:column;gap:7px}
    .comp-card{background:var(--surface);border:1px solid var(--border2);border-radius:var(--r);padding:10px 12px;transition:all .2s}
    .comp-card:hover{border-color:var(--rose-bd)}
    .comp-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:6px}
    .comp-card-text{font-size:13px;color:var(--cream);line-height:1.5;flex:1}
    .comp-card-meta{display:flex;gap:5px;align-items:center;flex-wrap:wrap}
    .comp-rating{display:flex;gap:3px}
    .comp-star{font-size:14px;cursor:pointer;transition:transform .15s;filter:grayscale(1);opacity:.4}
    .comp-star.on{filter:none;opacity:1;transform:scale(1.1)}
    .comp-hist-date{font-family:var(--fm);font-size:9px;color:var(--muted);letter-spacing:.04em}
    .comp-add-box{background:var(--surface2);border:1px solid var(--border2);border-radius:var(--r);padding:12px 14px;margin-bottom:12px}
    .comp-add-title{font-family:var(--fm);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--gold-dim);margin-bottom:8px}
    /* Offer response paste */
    .resp-paste-box{background:var(--surface2);border:1px solid var(--amber-bd);border-radius:var(--r);padding:12px 14px;margin-top:10px}
    .resp-paste-lbl{font-family:var(--fm);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--amber-tx);margin-bottom:6px}
    .resp-decoded{padding:10px 12px;background:var(--surface3);border:1px solid var(--border);border-radius:var(--r);margin-top:8px}
    .resp-status-acc{color:var(--green-tx)}
    .resp-status-dec{color:#e07070}
    .resp-status-ctr{color:var(--blue-tx)}
    .complete-modal-pts{font-family:var(--fd);font-size:36px;font-weight:700;color:var(--gold);text-align:center;margin:10px 0 4px}
    .complete-modal-lbl{font-family:var(--fm);font-size:10px;color:var(--muted);text-align:center;letter-spacing:.1em;text-transform:uppercase;margin-bottom:14px}
    /* Date Night Axis Picker */
    .axis-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}
    .axis-card{background:var(--surface);border:1px solid var(--border2);border-radius:var(--r);padding:10px 12px;transition:all .2s;cursor:pointer}
    .axis-card.selected{border-color:var(--gold-dim);background:var(--surface2)}
    .axis-label{font-family:var(--fm);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--gold-dim);margin-bottom:5px}
    .axis-chosen{font-size:13px;color:var(--cream);font-weight:600;min-height:18px;line-height:1.3}
    .axis-chosen.empty{color:var(--muted);font-weight:400;font-style:italic;font-size:12px}
    .axis-opts{display:flex;flex-direction:column;gap:4px;margin-top:8px;max-height:200px;overflow-y:auto}
    .axis-opt{padding:7px 10px;background:var(--surface2);border:1px solid var(--border2);border-radius:4px;font-size:13px;color:var(--cream-dim);cursor:pointer;transition:all .2s;text-align:left;width:100%}
    .axis-opt:hover{border-color:var(--gold-dim);color:var(--cream)}
    .axis-opt.on{border-color:var(--gold-dim);background:var(--gold-glow);color:var(--gold)}
    .axis-add-row{display:flex;gap:6px;margin-top:7px}
    .axis-add-inp{flex:1;background:var(--surface2);border:1px solid var(--border2);border-radius:4px;padding:6px 8px;color:var(--cream);font-family:var(--fb);font-size:13px;outline:none;min-width:0}
    .axis-add-inp:focus{border-color:var(--gold-dim)}
    .axis-add-btn{padding:6px 10px;background:none;border:1px solid var(--gold-dim);border-radius:4px;color:var(--gold);font-family:var(--fm);font-size:9px;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;white-space:nowrap;flex-shrink:0}
    .combo-result{background:linear-gradient(135deg,var(--surface2),var(--surface3));border:1px solid var(--border);border-radius:var(--r);padding:16px 18px;margin-bottom:14px;animation:fadein .35s ease}
    .combo-row{display:flex;gap:10px;align-items:flex-start;margin-bottom:7px}
    .combo-axis-lbl{font-family:var(--fm);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--gold-dim);width:46px;flex-shrink:0;padding-top:3px}
    .combo-axis-val{font-size:14px;color:var(--cream);line-height:1.4;flex:1}
    /* Offer point tracking */
    .opt-pts-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:6px}
    .opt-pts-btn{padding:9px 4px;background:var(--surface2);border:1px solid var(--border2);border-radius:var(--r);font-family:var(--fm);font-size:9px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);cursor:pointer;transition:all .2s;text-align:center}
    .opt-pts-btn.earn.on{background:var(--green-bg);border-color:var(--green-bd);color:var(--green-tx)}
    .opt-pts-btn.spend.on{background:var(--amber-bg);border-color:var(--amber-bd);color:var(--amber-tx)}
    .opt-pts-btn.none.on{background:var(--surface3);border-color:var(--border);color:var(--cream-dim)}
    .pts-tx-badge{display:inline-flex;align-items:center;gap:4px;padding:2px 9px;border-radius:10px;font-family:var(--fm);font-size:10px;letter-spacing:.06em;text-transform:uppercase}
    .ptx-earn{background:var(--green-bg);border:1px solid var(--green-bd);color:var(--green-tx)}
    .ptx-spend{background:var(--amber-bg);border:1px solid var(--amber-bd);color:var(--amber-tx)}
    /* Her World */
    .hw-section{margin-bottom:18px}
    .hw-section-title{font-family:var(--fd);font-size:16px;font-weight:600;color:var(--cream);margin-bottom:10px;display:flex;align-items:center;gap:7px}
    .hw-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .hw-field{display:flex;flex-direction:column;gap:4px}
    .hw-field.full{grid-column:1/-1}
    .hw-ll-opts{display:flex;flex-direction:column;gap:5px}
    .hw-ll-btn{padding:8px 12px;background:var(--surface2);border:1px solid var(--border2);border-radius:var(--r);color:var(--muted);font-family:var(--fb);font-size:13px;cursor:pointer;transition:all .2s;text-align:left}
    .hw-ll-btn.on{border-color:var(--rose-bd);background:var(--rose-bg);color:var(--rose-tx)}
    .hw-ll-btn:hover:not(.on){border-color:var(--gold-dim);color:var(--cream-dim)}
    .hw-save-btn{width:100%;padding:11px;background:var(--rose-bg);border:1px solid var(--rose-bd);border-radius:var(--r);color:var(--rose-tx);font-family:var(--fm);font-size:11px;letter-spacing:.09em;text-transform:uppercase;cursor:pointer;transition:all .2s;margin-top:4px}
    .hw-save-btn:hover{background:rgba(139,34,82,.28)}
    /* Dev Toolkit */
    .dev-toggle-row{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:var(--surface2);border:1px solid var(--border2);border-radius:var(--r);margin-bottom:8px;cursor:pointer}
    .dev-toggle-lbl{font-family:var(--fm);font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:var(--muted)}
    .dev-toggle-lbl.on{color:var(--amber-tx)}
    .dev-pill{padding:3px 9px;border-radius:10px;font-family:var(--fm);font-size:9px;letter-spacing:.07em;text-transform:uppercase}
    .dev-pill.on{background:var(--amber-bg);border:1px solid var(--amber-bd);color:var(--amber-tx)}
    .dev-pill.off{background:var(--surface3);border:1px solid var(--border2);color:var(--muted)}
    .dev-section{background:var(--surface2);border:1px solid var(--amber-bd);border-radius:var(--r);padding:13px 14px;margin-bottom:12px}
    .dev-section-title{font-family:var(--fm);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--amber-tx);margin-bottom:10px}
    .comp-screen{margin-bottom:12px}
    .comp-screen-name{font-family:var(--fm);font-size:10px;letter-spacing:.09em;text-transform:uppercase;color:var(--gold-dim);margin-bottom:5px;padding-bottom:4px;border-bottom:1px solid var(--border2)}
    .comp-item{display:flex;align-items:center;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border2)}
    .comp-item:last-child{border-bottom:none}
    .comp-item-id{font-family:var(--fm);font-size:10px;color:var(--muted);flex:1}
    .comp-item-lbl{font-size:12px;color:var(--cream-dim);flex:1}
    .comp-copy-btn{padding:2px 8px;background:none;border:1px solid var(--border2);border-radius:4px;color:var(--muted);font-family:var(--fm);font-size:9px;cursor:pointer;transition:all .2s;flex-shrink:0}
    .comp-copy-btn:hover{border-color:var(--gold-dim);color:var(--gold)}
    .comp-copy-btn.copied{border-color:var(--green-bd);color:var(--green-tx)}
    .bug-form{display:flex;flex-direction:column;gap:8px}
    .bug-sev{display:flex;gap:6px}
    .bug-sev-btn{flex:1;padding:6px 4px;background:none;border:1px solid var(--border2);border-radius:var(--r);font-family:var(--fm);font-size:9px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);cursor:pointer;transition:all .2s;text-align:center}
    .bug-sev-btn.cosmetic.on{background:var(--blue-bg);border-color:var(--blue-bd);color:var(--blue-tx)}
    .bug-sev-btn.functional.on{background:var(--amber-bg);border-color:var(--amber-bd);color:var(--amber-tx)}
    .bug-sev-btn.blocking.on{background:rgba(192,57,43,.15);border-color:rgba(192,57,43,.35);color:#e07070}
    .bug-log-item{padding:8px 10px;background:var(--surface3);border-radius:var(--r);margin-bottom:6px;border-left:3px solid var(--border2)}
    .bug-log-item.cosmetic{border-left-color:var(--blue-tx)}
    .bug-log-item.functional{border-left-color:var(--amber-tx)}
    .bug-log-item.blocking{border-left-color:#e07070}
    .bug-log-item.resolved{opacity:.45}
    .bug-id{font-family:var(--fm);font-size:9px;color:var(--gold-dim);letter-spacing:.07em;text-transform:uppercase}
    .bug-comp{font-family:var(--fm);font-size:9px;color:var(--muted);margin-top:1px}
    .bug-desc{font-size:13px;color:var(--cream-dim);margin-top:4px;line-height:1.4}
    .bug-actions{display:flex;gap:6px;margin-top:6px}
    .bug-act-btn{padding:2px 8px;background:none;border:1px solid var(--border2);border-radius:4px;color:var(--muted);font-family:var(--fm);font-size:9px;cursor:pointer;transition:all .2s}
    .bug-act-btn:hover{border-color:var(--gold-dim);color:var(--gold)}
    .session-notes-area{width:100%;background:var(--surface3);border:1px solid var(--border2);border-radius:var(--r);padding:10px 12px;color:var(--cream);font-family:var(--fb);font-size:14px;outline:none;resize:none;min-height:120px;line-height:1.5}
    .session-notes-area:focus{border-color:var(--amber-bd)}
    .handoff-box{background:var(--surface3);border:1px solid var(--border);border-radius:var(--r);padding:10px 12px;margin-top:8px}
    .handoff-text{font-family:var(--fm);font-size:10px;color:var(--cream-dim);line-height:1.7;white-space:pre-wrap;word-break:break-word}
  `}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const useStorage = (key, init) => {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; }
    catch { return init; }
  });
  const set = useCallback(v => {
    setVal(v); try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  }, [key]);
  return [val, set];
};

const TODAY = new Date();
const fmtDate   = (m, d) => new Date(2000, m-1, d).toLocaleDateString("en-US",{month:"short",day:"numeric"});
const daysUntil = (m, d) => { const t=new Date(TODAY.getFullYear(),m-1,d); if(t<TODAY) t.setFullYear(TODAY.getFullYear()+1); return Math.ceil((t-TODAY)/86400000); };
const urgency   = days => days<=7?"urgent":days<=30?"soon":"";
const annYear   = (sy, m) => { if(!sy) return null; const nm=new Date(TODAY.getFullYear(),m-1,1); return TODAY>=nm?TODAY.getFullYear()-sy:TODAY.getFullYear()-sy-1; };

// Recurring task helpers
const daysBetween = (a, b) => Math.floor((new Date(b)-new Date(a))/86400000);
const isTaskDue = task => {
  if (!task.recurring || !task.lastCompleted) return true;
  const days = daysBetween(task.lastCompleted, TODAY_STR);
  if (task.recurring === "weekly")  return days >= 7;
  if (task.recurring === "monthly") return days >= 30;
  return true;
};
const nextDueIn = task => {
  if (!task.recurring || !task.lastCompleted) return null;
  const days = daysBetween(task.lastCompleted, TODAY_STR);
  const interval = task.recurring === "weekly" ? 7 : 30;
  return Math.max(0, interval - days);
};

// Streak helpers
const calcStreak = (taskHistory) => {
  if (!taskHistory || taskHistory.length === 0) return { current: 0, best: 0 };
  const days = [...new Set(taskHistory.map(h => h.date))].sort().reverse();
  let current = 0;
  let check = TODAY_STR;
  for (const d of days) {
    if (d === check || daysBetween(d, check) === 0) { current++; check = new Date(new Date(d).getTime()-86400000).toISOString().slice(0,10); }
    else if (daysBetween(d, check) === 1 && current === 0) { current = 1; check = new Date(new Date(d).getTime()-86400000).toISOString().slice(0,10); }
    else break;
  }
  // best streak
  let best = 0, run = 1;
  for (let i = 1; i < days.length; i++) {
    if (daysBetween(days[i], days[i-1]) === 1) { run++; best = Math.max(best, run); }
    else run = 1;
  }
  best = Math.max(best, current);
  return { current, best };
};

// Offer encoding/decoding
const encodeOffer    = obj => btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
const buildOfferUrl  = offer => `https://jmarsh85.github.io/hw-offer/#${encodeOffer(offer)}`;
const decodeToken    = token => { try { return JSON.parse(decodeURIComponent(escape(atob(token.trim())))); } catch { return null; } };
const CAT_COLOR      = { Fancy:"#c9a84c", Casual:"#7ab88a", "At Home":"#90bcd8", Adventure:"#d4a060", Nostalgic:"#c48aaa" };

// Tier helper for custom rewards
const tierFromCost = cost => {
  if (cost < 100) return { tier:"bronze", label:"Bronze", icon:"🥉" };
  if (cost < 300) return { tier:"silver", label:"Silver", icon:"🥈" };
  if (cost < 700) return { tier:"gold",   label:"Gold",   icon:"🥇" };
  return { tier:"legendary", label:"Legendary", icon:"💎" };
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const Toast    = ({msg}) => msg ? <div className="toast">{msg}</div> : null;
const DiffDots = ({level}) => <span className="tdots">{[1,2,3,4,5].map(i=><span key={i} className={`dot${i<=level?" on":""}`}/>)}</span>;

// ─────────────────────────────────────────────────────────────────────────────
// TASK COMPLETION MODAL (with bonus multipliers)
// ─────────────────────────────────────────────────────────────────────────────
function CompleteTaskModal({ task, onConfirm, onClose }) {
  const [selected, setSelected] = useState(new Set());
  const basePts  = task.pts;
  const bonusPct = [...selected].reduce((s, id) => s + (BONUSES.find(b=>b.id===id)?.pct||0), 0);
  const totalPts = Math.round(basePts * (1 + bonusPct/100));

  const toggle = id => {
    setSelected(prev => { const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="mhandle"/>
        <div className="mtitle">Complete Task ✓</div>
        <div style={{fontSize:"14px",color:"var(--cream-dim)",marginBottom:"14px",lineHeight:"1.4"}}>
          <strong style={{color:"var(--cream)"}}>{task.name}</strong><br/>
          Apply any bonuses that apply before confirming.
        </div>

        <div className="bonus-picker">
          <div className="bonus-title">Bonus Multipliers</div>
          <div className="bonus-opts">
            {BONUSES.map(b=>(
              <button key={b.id} className={`bonus-opt${selected.has(b.id)?" on":""}`} onClick={()=>toggle(b.id)}>
                <span className="bonus-opt-icon">{b.icon}</span>
                <span className="bonus-opt-body">
                  <span className="bonus-opt-lbl">{b.label}</span>
                  <span style={{display:"block"}} className="bonus-opt-desc">{b.desc}</span>
                </span>
                <span className="bonus-opt-pct">+{b.pct}%</span>
              </button>
            ))}
          </div>
          <div className="bonus-total">
            <span className="bonus-total-lbl">
              {basePts} pts{bonusPct>0?` + ${bonusPct}% bonus`:""}
            </span>
            <span className="bonus-total-pts">{totalPts} pts</span>
          </div>
        </div>

        <div className="macts">
          <button className="btn-s" onClick={onClose}>Cancel</button>
          <button className="btn-p" onClick={()=>onConfirm(totalPts, [...selected])}>
            Earn {totalPts} pts →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function Dashboard({ points, tasks, events, hints, taskHistory, setTab }) {
  const pending     = tasks.filter(t=>t.status==="pending").length;
  const done        = tasks.filter(t=>t.status==="completed").length;
  const activeHints = hints.filter(h=>h.status==="active").length;
  const compliment  = COMPLIMENTS[Math.floor(Date.now()/86400000)%COMPLIMENTS.length];
  const nextEvent   = [...events].map(e=>({...e,days:daysUntil(e.month,e.day)})).sort((a,b)=>a.days-b.days)[0];
  const streak      = calcStreak(taskHistory);

  return (
    <div>
      <div className="greet">
        <div className="greet-sub">{TODAY.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>
        <div className="greet-main">Welcome back, <span>husband.</span></div>
      </div>
      <div className="dgrid">
        <div className="dcard">
          <div className="dcard-lbl">HW Points</div>
          <div className="dcard-val">{points}</div>
          <div className="dcard-sub">your balance</div>
        </div>
        <div className="dcard">
          <div className="dcard-lbl">Open Tasks</div>
          <div className="dcard-val">{pending}</div>
          <div className="dcard-sub">{done} completed</div>
        </div>
        {nextEvent && (
          <div className={`dcard${nextEvent.days<=7?" urge":""}`}>
            <div className="dcard-lbl">{nextEvent.icon} {nextEvent.name}</div>
            <div className="dcard-val">{nextEvent.days}</div>
            <div className="dcard-sub">days · {fmtDate(nextEvent.month,nextEvent.day)}</div>
          </div>
        )}
        <div className={`dcard${streak.current>=3?" streak":""}`}>
          <div className="dcard-lbl">{streak.current>=3?"🔥 ":""}Streak</div>
          <div className="dcard-val" style={streak.current>=3?{color:"var(--amber-tx)"}:{}}>{streak.current}</div>
          <div className="dcard-sub">{streak.current===1?"day active":`days · best ${streak.best}`}</div>
        </div>
      </div>

      <div className="nudge">
        <div className="nudge-icon">💬</div>
        <div className="nudge-lbl">Today's Compliment</div>
        <div className="nudge-txt">"{compliment}"</div>
        <button className="nudge-btn" onClick={()=>setTab("honeydо")}>Log a Task →</button>
      </div>

      {nextEvent && nextEvent.days<=14 && (
        <div className="nudge alert">
          <div className="nudge-icon">⚠️</div>
          <div className="nudge-lbl">Upcoming Alert</div>
          <div className="nudge-txt" style={{fontSize:"14px"}}>
            <strong style={{color:"var(--red)"}}>{nextEvent.name}</strong> is in {nextEvent.days} day{nextEvent.days!==1?"s":""}. {nextEvent.notes||"Don't wait — plan now."}
          </div>
          <button className="nudge-btn" style={{borderColor:"rgba(192,57,43,.5)",color:"var(--red)"}} onClick={()=>setTab("events")}>View Event →</button>
        </div>
      )}

      <div className="qactions">
        {[
          {icon:"✅",label:"Log Task",     tab:"honeydо"},
          {icon:"💡",label:"Capture Hint", tab:"hints"},
          {icon:"🍷",label:"Plan a Date",  tab:"dates"},
          {icon:"📨",label:"Send an Offer",tab:"offers"},
        ].map(a=>(
          <button key={a.tab} className="qbtn" onClick={()=>setTab(a.tab)}>
            <span className="qicon">{a.icon}</span>{a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HONEY-DO
// ─────────────────────────────────────────────────────────────────────────────
function AddTaskModal({ onAdd, onClose }) {
  const [name,setName]       = useState("");
  const [cat,setCat]         = useState("Home Repair");
  const [diff,setDiff]       = useState(2);
  const [recurring,setRec]   = useState("none");

  const handle = () => {
    if (!name.trim()) return;
    const d = DIFFICULTIES.find(x=>x.level===diff);
    onAdd({
      id: Date.now(),
      name: name.trim(),
      category: cat,
      difficulty: diff,
      status: "pending",
      pts: d.pts,
      recurring: recurring==="none"?null:recurring,
      lastCompleted: null,
      addedDate: TODAY_STR,
    });
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="mhandle"/>
        <div className="mtitle">Add a Task</div>
        <div className="fgrp"><label className="flbl">Task Name</label><input className="finp" placeholder="e.g. Fix the garage door" value={name} onChange={e=>setName(e.target.value)}/></div>
        <div className="fgrp"><label className="flbl">Category</label><select className="finp" value={cat} onChange={e=>setCat(e.target.value)}>{CATEGORIES.filter(c=>c!=="All").map(c=><option key={c}>{c}</option>)}</select></div>
        <div className="fgrp">
          <label className="flbl">Difficulty & Points</label>
          <div className="diffs">{DIFFICULTIES.map(d=><button key={d.level} className={`dopt${diff===d.level?" on":""}`} onClick={()=>setDiff(d.level)}><span className="dopt-pts">{d.pts}</span>{d.label}</button>)}</div>
        </div>
        <div className="fgrp">
          <label className="flbl">Recurring Schedule</label>
          <div style={{display:"flex",gap:"6px"}}>
            {[["none","One-time"],["weekly","Weekly"],["monthly","Monthly"]].map(([v,l])=>(
              <button key={v} className={`dopt${recurring===v?" on":""}`} style={{flex:1,fontSize:"10px"}} onClick={()=>setRec(v)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="macts"><button className="btn-s" onClick={onClose}>Cancel</button><button className="btn-p" onClick={handle}>Add Task</button></div>
      </div>
    </div>
  );
}

function HoneyDo({ tasks, setTasks, points, setPoints, taskHistory, setTaskHistory, showToast, onMutate }) {
  const [filter,    setFilter]   = useState("All");
  const [showAdd,   setShowAdd]  = useState(false);
  const [completing,setComp]     = useState(null); // task being completed
  const [showHist,  setShowHist] = useState(false);
  const [viewRec,   setViewRec]  = useState("all"); // all | pending | recurring

  const streak    = calcStreak(taskHistory);
  const nextRew   = DEFAULT_REWARDS_HIM.find(r=>r.cost>points);

  // Auto-reset recurring tasks that are due
  useEffect(() => {
    const updated = tasks.map(t => {
      if (t.recurring && t.status==="completed" && isTaskDue(t)) {
        return { ...t, status:"pending" };
      }
      return t;
    });
    const changed = updated.some((t,i)=>t.status!==tasks[i].status);
    if (changed) setTasks(updated);
  }, []); // eslint-disable-line

  const filtered = tasks.filter(t => {
    const catOk  = filter==="All" || t.category===filter;
    const recOk  = viewRec==="all" ? true
                 : viewRec==="recurring" ? !!t.recurring
                 : !t.recurring;
    return catOk && recOk;
  });

  const confirmComplete = (task, totalPts, bonuses) => {
    const nowDone = task.status === "pending";
    if (nowDone) {
      // complete it
      setTasks(tasks.map(t => t.id===task.id ? {...t, status:"completed", lastCompleted:TODAY_STR} : t));
      setPoints(points + totalPts);
      const entry = { id:task.id, name:task.name, date:TODAY_STR, pts:totalPts, bonuses };
      const newHist = [entry, ...taskHistory].slice(0,50);
      setTaskHistory(newHist);
      // streak milestones
      const newStreak = calcStreak(newHist);
      const milestones = [3,7,14,30];
      if (milestones.includes(newStreak.current)) {
        showToast(`🔥 ${newStreak.current}-day streak! Keep it up!`);
      } else {
        showToast(`+${totalPts} HW Points earned!${bonuses.length?" ⭐ Bonus applied!":""}`);
      }
    } else {
      setTasks(tasks.map(t => t.id===task.id ? {...t, status:"pending", lastCompleted:null} : t));
      setPoints(Math.max(0, points - task.pts));
      showToast("Task reopened.");
    }
    onMutate();
    setComp(null);
  };

  const handleTaskClick = task => {
    if (task.status === "pending") {
      setComp(task);
    } else {
      // uncomplete directly (no bonus to remove)
      confirmComplete(task, task.pts, []);
    }
  };

  return (
    <div>
      {showAdd && <AddTaskModal onAdd={t=>{setTasks([t,...tasks]);showToast("Task added.");onMutate();}} onClose={()=>setShowAdd(false)}/>}
      {completing && <CompleteTaskModal task={completing} onConfirm={(pts,bonuses)=>confirmComplete(completing,pts,bonuses)} onClose={()=>setComp(null)}/>}

      <div className="sec-hdr">
        <div className="sec-title">Honey‑<span>Do</span></div>
        <div style={{display:"flex",gap:"10px",alignItems:"center"}}>
          <button className="sec-act" onClick={()=>setShowHist(!showHist)}>{showHist?"▲ Hide":"📋 History"}</button>
          <button className="sec-act" onClick={()=>setShowAdd(true)}>+ Add Task</button>
        </div>
      </div>

      {/* Streak bar */}
      {streak.current > 0 && (
        <div className="streak-bar">
          <div className="streak-flame">{streak.current>=7?"🔥":"⚡"}</div>
          <div className="streak-info">
            <div className="streak-num">{streak.current}</div>
            <div className="streak-lbl">Day Streak</div>
            {streak.best > streak.current && <div className="streak-best">Best: {streak.best} days</div>}
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:"11px",color:"var(--muted)",fontFamily:"var(--fm)",letterSpacing:".06em"}}>Today's earned</div>
            <div style={{fontFamily:"var(--fd)",fontSize:"18px",color:"var(--gold)"}}>
              {taskHistory.filter(h=>h.date===TODAY_STR).reduce((s,h)=>s+h.pts,0)} pts
            </div>
          </div>
        </div>
      )}

      {/* Task History */}
      {showHist && (
        <div className="card" style={{marginBottom:"13px"}}>
          <div className="sub-lbl" style={{marginBottom:"8px"}}>Recent Completions</div>
          {taskHistory.length===0
            ? <div style={{fontSize:"13px",color:"var(--muted)",fontStyle:"italic"}}>No completions yet.</div>
            : taskHistory.slice(0,20).map((h,i)=>(
              <div key={i} className="hist-item">
                <span className="hist-name">{h.name}</span>
                <span className="hist-meta">
                  {h.bonuses?.length>0 && <span style={{fontSize:"11px",color:"var(--amber-tx)"}}>⭐</span>}
                  <span className="hist-pts">+{h.pts}</span>
                  <span className="hist-date">{h.date}</span>
                </span>
              </div>
            ))
          }
        </div>
      )}

      <div className="pts-banner">
        <div>
          <div className="pts-big">{points}</div>
          <div className="pts-lbl2">HW Points</div>
          {nextRew&&<div className="pts-bar"><div className="pts-fill" style={{width:`${Math.min(100,(points/nextRew.cost)*100)}%`}}/></div>}
        </div>
        {nextRew&&<div style={{textAlign:"right"}}>
          <div style={{fontSize:"10px",color:"var(--muted)",fontFamily:"var(--fm)",textTransform:"uppercase",letterSpacing:".06em"}}>Next His Reward</div>
          <div style={{fontFamily:"var(--fd)",fontSize:"13px",color:"var(--cream-dim)",fontStyle:"italic",marginTop:"2px"}}>{nextRew.name}</div>
          <div style={{fontSize:"11px",color:"var(--muted)",fontFamily:"var(--fm)",marginTop:"2px"}}>{nextRew.cost-points} pts to go</div>
        </div>}
      </div>

      {/* Filters */}
      <div className="filters">
        {CATEGORIES.map(c=><button key={c} className={`chip${filter===c?" on":""}`} onClick={()=>setFilter(c)}>{c}</button>)}
      </div>
      <div className="filters" style={{marginBottom:"14px"}}>
        {[["all","All"],["recurring","🔁 Recurring"],["none","One-time"]].map(([v,l])=>(
          <button key={v} className={`chip${viewRec===v?" on":""}`} onClick={()=>setViewRec(v)}>{l}</button>
        ))}
      </div>

      {filtered.length===0
        ? <div className="empty"><div className="empty-icon">🛠️</div><div className="empty-txt">No tasks here.</div></div>
        : <div className="tlist">{filtered.map(task=>{
            const due = nextDueIn(task);
            const dueSoon = due !== null && due <= 2 && task.status==="pending";
            return (
              <div key={task.id} className={`tcard${task.status==="completed"?" done":""}${dueSoon?" due-soon":""}`} onClick={()=>handleTaskClick(task)}>
                <div className="tcheck">{task.status==="completed"?"✓":""}</div>
                <div className="tbody">
                  <div className="tname">{task.name}</div>
                  <div className="tmeta">
                    <span className="tcat">{task.category}</span>
                    <DiffDots level={task.difficulty}/>
                    {task.recurring && (
                      <span className={`rec-badge rec-${task.recurring}`}>{task.recurring==="weekly"?"↻ weekly":"↻ monthly"}</span>
                    )}
                    {due !== null && task.status==="pending" && (
                      <span style={{fontSize:"9px",color:due<=1?"var(--red)":"var(--muted)",fontFamily:"var(--fm)"}}>
                        {due===0?"due today":`due in ${due}d`}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div className="tpts">{task.pts}</div>
                  <div className="tpts-lbl">pts</div>
                </div>
              </div>
            );
          })}</div>
      }
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REWARDS
// ─────────────────────────────────────────────────────────────────────────────
function AddRewardModal({ forTab, onAdd, onClose }) {
  const [name, setName] = useState("");
  const [cost, setCost] = useState(100);
  const [icon, setIcon] = useState("🎁");
  const ICONS = ["🎁","🎀","🌹","💐","🍾","🥂","💅","👗","💍","🏆","🍕","🎮","🛒","✈️","🎟️","💆","🏌️","⚽","🎯","🛏️"];
  const preview = tierFromCost(+cost);

  const handle = () => {
    if (!name.trim() || !cost) return;
    const t = tierFromCost(+cost);
    onAdd({
      id: `custom_${Date.now()}`,
      tier: t.tier, label: t.label, icon,
      name: name.trim(), cost: +cost,
      custom: true,
      forTab,
    });
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="mhandle"/>
        <div className="mtitle">Add Custom Reward</div>
        <div className="fgrp">
          <label className="flbl">Reward Name</label>
          <input className="finp" placeholder="e.g. Movie night of my choice" value={name} onChange={e=>setName(e.target.value)}/>
        </div>
        <div className="fgrp">
          <label className="flbl">Point Cost</label>
          <input className="finp" type="number" min="1" value={cost} onChange={e=>setCost(e.target.value)}/>
          <div style={{fontSize:"12px",color:"var(--muted)",marginTop:"4px",fontFamily:"var(--fm)"}}>
            Auto-tier: <span style={{color:preview.tier==="legendary"?"#c9a84c":preview.tier==="gold"?"#d4a060":preview.tier==="silver"?"var(--blue-tx)":"var(--cream-dim)"}}>{preview.icon} {preview.label}</span>
          </div>
        </div>
        <div className="fgrp">
          <label className="flbl">Icon</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginTop:"4px"}}>
            {ICONS.map(ic=>(
              <button key={ic} onClick={()=>setIcon(ic)} style={{
                width:"34px",height:"34px",border:`1px solid ${icon===ic?"var(--gold-dim)":"var(--border2)"}`,
                borderRadius:"var(--r)",background:icon===ic?"var(--gold-glow)":"var(--surface2)",
                fontSize:"16px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"
              }}>{ic}</button>
            ))}
          </div>
        </div>
        <div className="macts">
          <button className="btn-s" onClick={onClose}>Cancel</button>
          <button className="btn-p" disabled={!name.trim()||!cost} onClick={handle}>Add Reward</button>
        </div>
      </div>
    </div>
  );
}

function Rewards({ points, setPoints, rewardsHer, setRewardsHer, rewardsHim, setRewardsHim, showToast, onMutate }) {
  const [tab,      setTab]      = useState("her");
  const [showAdd,  setShowAdd]  = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [editCost, setEditCost] = useState("");

  const list    = tab==="her" ? rewardsHer : rewardsHim;
  const setList = tab==="her" ? setRewardsHer : setRewardsHim;
  const tiers   = ["bronze","silver","gold","legendary"];
  const labels  = {bronze:"🥉 Bronze",silver:"🥈 Silver",gold:"🥇 Gold",legendary:"💎 Legendary"};

  const redeem = r => {
    if (points < r.cost) return;
    setPoints(points - r.cost);
    showToast(`"${r.name}" redeemed! 🎉`);
  };

  const deleteReward = id => {
    setList(list.filter(r=>r.id!==id));
    onMutate();
    showToast("Reward removed.");
  };

  const startEdit = r => { setEditId(r.id); setEditCost(String(r.cost)); };

  const saveEdit = id => {
    const newCost = parseInt(editCost,10);
    if (!newCost || newCost < 1) return;
    const t = tierFromCost(newCost);
    setList(list.map(r => r.id===id ? {...r, cost:newCost, tier:t.tier, label:t.label, icon:r.custom?r.icon:t.icon} : r));
    setEditId(null);
    onMutate();
  };

  const handleAdd = reward => {
    setList([...list, reward]);
    onMutate();
    showToast("Custom reward added! 🎁");
  };

  return (
    <div>
      {showAdd && <AddRewardModal forTab={tab} onAdd={handleAdd} onClose={()=>setShowAdd(false)}/>}

      <div className="sec-hdr">
        <div className="sec-title"><span>Reward</span> Store</div>
        <div style={{display:"flex",gap:"10px",alignItems:"center"}}>
          <span style={{fontFamily:"var(--fd)",fontSize:"16px",color:"var(--gold)"}}>{points} pts</span>
          <button className="sec-act" onClick={()=>setShowAdd(true)}>+ Custom</button>
        </div>
      </div>

      <div className="rtoggle">
        <button className={`rtbtn${tab==="her"?" her":""}`} onClick={()=>setTab("her")}>🌹 For Her</button>
        <button className={`rtbtn${tab==="him"?" him":""}`} onClick={()=>setTab("him")}>🏆 For Him</button>
      </div>

      <div style={{padding:"8px 11px",background:tab==="her"?"var(--rose-bg)":"var(--blue-bg)",border:`1px solid ${tab==="her"?"var(--rose-bd)":"var(--blue-bd)"}`,borderRadius:"var(--r)",marginBottom:"13px",fontSize:"13px",color:tab==="her"?"var(--rose-tx)":"var(--blue-tx)",fontStyle:"italic"}}>
        {tab==="her"?"Points you earn go toward her enjoyment. She can adjust the cost.":"Points you earn for yourself — redeem when ready."}
      </div>

      {tiers.map(tier => {
        const items = list.filter(r=>r.tier===tier);
        if (!items.length) return null;
        return (
          <div key={tier} style={{marginBottom:"14px"}}>
            <div className="sub-lbl">{labels[tier]}</div>
            <div className="rlist">
              {items.map(r=>(
                <div key={r.id} className={`rcard${r.custom?" custom-r":""}`}>
                  <div className="rbadge">{r.icon}</div>
                  <div className="rbody">
                    <div className="rname">{r.name}{r.custom&&<span style={{marginLeft:"6px",fontSize:"10px",color:"var(--green-tx)",fontFamily:"var(--fm)"}}>custom</span>}</div>
                    {editId===r.id ? (
                      <div style={{display:"flex",gap:"5px",marginTop:"4px",alignItems:"center"}}>
                        <input
                          className="finp"
                          type="number"
                          value={editCost}
                          onChange={e=>setEditCost(e.target.value)}
                          style={{width:"80px",padding:"4px 8px",fontSize:"13px"}}
                        />
                        <button className="btn-p" style={{padding:"4px 10px",fontSize:"10px",flex:"none"}} onClick={()=>saveEdit(r.id)}>Save</button>
                        <button className="btn-s" style={{padding:"4px 8px",fontSize:"10px"}} onClick={()=>setEditId(null)}>✕</button>
                      </div>
                    ) : (
                      <>
                        <div className="rtier-lbl">{r.label} Tier{r.custom?" · tap cost to edit":""}</div>
                        <button className="r-red" disabled={points<r.cost} onClick={()=>redeem(r)}>
                          {points>=r.cost?"Redeem":`Need ${r.cost-points} more pts`}
                        </button>
                        {r.custom && (
                          <div style={{display:"flex",gap:"6px",marginTop:"4px"}}>
                            <button className="r-red" style={{flex:1}} onClick={()=>startEdit(r)}>✏️ Edit Cost</button>
                            <button className="r-del" style={{flex:1}} onClick={()=>deleteReward(r.id)}>🗑 Remove</button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div className="rcost">{r.cost}</div>
                    <div className="rcost-lbl">pts</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────────────────────────────────────────
function AddEventModal({ onAdd, onClose }) {
  const [name,setName]=useState(""); const [cat,setCat]=useState("custom"); const [month,setMonth]=useState(1); const [day,setDay]=useState(1); const [year,setYear]=useState(""); const [notes,setNotes]=useState("");
  const icons={anniversary:"💍",birthday:"🎂",holiday:"🎉",custom:"📌"};
  const handle=()=>{ if(!name.trim()) return; onAdd({id:Date.now(),name:name.trim(),category:cat,month:+month,day:+day,startYear:year?+year:null,isAnnual:true,alertDays:[30,14,7,1],icon:icons[cat],notes}); onClose(); };
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="mhandle"/><div className="mtitle">Add an Event</div>
        <div className="fgrp"><label className="flbl">Event Name</label><input className="finp" placeholder="e.g. Her Sister's Birthday" value={name} onChange={e=>setName(e.target.value)}/></div>
        <div className="fgrp"><label className="flbl">Category</label><select className="finp" value={cat} onChange={e=>setCat(e.target.value)}><option value="anniversary">Anniversary</option><option value="birthday">Birthday</option><option value="holiday">Holiday</option><option value="custom">Custom</option></select></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px"}}>
          <div className="fgrp"><label className="flbl">Month</label><input className="finp" type="number" min="1" max="12" value={month} onChange={e=>setMonth(e.target.value)}/></div>
          <div className="fgrp"><label className="flbl">Day</label><input className="finp" type="number" min="1" max="31" value={day} onChange={e=>setDay(e.target.value)}/></div>
          <div className="fgrp"><label className="flbl">Start Yr</label><input className="finp" type="number" placeholder="opt" value={year} onChange={e=>setYear(e.target.value)}/></div>
        </div>
        <div className="fgrp"><label className="flbl">Notes</label><textarea className="ftxt" placeholder="Reminders or tips…" value={notes} onChange={e=>setNotes(e.target.value)}/></div>
        <div className="macts"><button className="btn-s" onClick={onClose}>Cancel</button><button className="btn-p" onClick={handle}>Add Event</button></div>
      </div>
    </div>
  );
}

function Events({ events, setEvents, showToast, onMutate }) {
  const [showAdd,setShowAdd]=useState(false); const [showTrad,setShowTrad]=useState(false);
  const sorted=[...events].map(e=>({...e,days:daysUntil(e.month,e.day)})).sort((a,b)=>a.days-b.days);
  const bc=cat=>({anniversary:"eb-ann",birthday:"eb-bday",holiday:"eb-hol",custom:"eb-cust"}[cat]||"eb-cust");
  return (
    <div>
      {showAdd&&<AddEventModal onAdd={e=>{setEvents([...events,e]);showToast("Event added! 📅");onMutate();}} onClose={()=>setShowAdd(false)}/>}
      <div className="sec-hdr"><div className="sec-title">Event <span>Command</span></div><button className="sec-act" onClick={()=>setShowAdd(true)}>+ Add</button></div>
      <button className="btn-f btn-exp" style={{marginBottom:"13px"}} onClick={()=>setShowTrad(!showTrad)}>{showTrad?"▲ Hide":"▼ Show"} Anniversary Traditions</button>
      {showTrad&&<div className="card" style={{marginBottom:"13px"}}>
        <div className="sub-lbl" style={{marginBottom:"8px"}}>Anniversary Gift Traditions</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"3px 12px"}}>
          {Object.entries(ANNIVERSARY_TRADITIONS).map(([yr,gift])=>(
            <div key={yr} style={{display:"flex",justifyContent:"space-between",fontSize:"12px",padding:"3px 0",borderBottom:"1px solid var(--border2)"}}>
              <span style={{fontFamily:"var(--fm)",color:"var(--gold-dim)",fontSize:"10px"}}>Yr {yr}</span>
              <span style={{color:"var(--cream-dim)"}}>{gift}</span>
            </div>
          ))}
        </div>
      </div>}
      {sorted.length===0?<div className="empty"><div className="empty-icon">📅</div><div className="empty-txt">No events yet.</div></div>:
        <div className="elist">{sorted.map(ev=>{
          const ug=urgency(ev.days); const yr=ev.category==="anniversary"&&ev.startYear?annYear(ev.startYear,ev.month):null; const trad=yr&&ANNIVERSARY_TRADITIONS[yr];
          return (
            <div key={ev.id} className={`ecard${ug?" "+ug:""}`}>
              <div className="etop">
                <div className="eicon">{ev.icon}</div>
                <div className="ebody"><div className="ename">{ev.name}</div><div className="edate">{fmtDate(ev.month,ev.day)} · Annual</div></div>
                <div className="ecount"><div className={`edays${ev.days===0?" today":ev.days<=7?" urg":""}`}>{ev.days===0?"🎉":ev.days}</div>{ev.days>0&&<div className="edays-lbl">days</div>}</div>
              </div>
              <div className="emeta"><span className={`ebadge ${bc(ev.category)}`}>{ev.category}</span>{yr&&<span style={{fontSize:"12px",color:"var(--cream-dim)",fontStyle:"italic"}}>Year {yr}</span>}</div>
              {trad&&<div className="etrad">🎁 Year {yr} tradition: <strong>{trad}</strong></div>}
              {ev.notes&&<div className="enotes">💡 {ev.notes}</div>}
              <div className="ealerts">{ev.alertDays.map(d=><span key={d} className={`achip${ev.days<=d?" fired":""}`}>{d}d</span>)}</div>
            </div>
          );
        })}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DATE NIGHT PLANNER
// ─────────────────────────────────────────────────────────────────────────────
function DatePlanner({ dateHistory, setDateHistory, dateAxes, setDateAxes, showToast }) {
  const axes = dateAxes || DEFAULT_DATE_AXES;
  const [activeAxis,   setActiveAxis]   = useState(null);
  const [picks,        setPicks]        = useState({ what:null, where:null, how:null, when:null });
  const [comboResult,  setComboResult]  = useState(null);
  const [view,         setView]         = useState("picker");
  const [addVals,      setAddVals]      = useState({ what:"", where:"", how:"", when:"" });
  const [catFilter,    setCatFilter]    = useState("All");

  const AXIS_META = {
    what:  { label:"What",  icon:"🎯", q:"What are you doing?" },
    where: { label:"Where", icon:"📍", q:"Where are you going?" },
    how:   { label:"How",   icon:"✨", q:"What's the vibe?" },
    when:  { label:"When",  icon:"🗓", q:"When is this happening?" },
  };

  const pickAxis = (axis, val) => { setPicks(p=>({...p,[axis]:val})); setActiveAxis(null); setComboResult(null); };
  const clearAxis = (axis,e) => { e.stopPropagation(); setPicks(p=>({...p,[axis]:null})); setComboResult(null); };

  const buildCombo = (basePicks) => {
    const result = {};
    Object.keys(AXIS_META).forEach(axis => {
      const pool = axes[axis] || DEFAULT_DATE_AXES[axis];
      result[axis] = basePicks[axis] || pool[Math.floor(Math.random()*pool.length)];
    });
    return result;
  };

  const spin    = () => { const r=buildCombo(picks);   setPicks(r); setComboResult(r); setActiveAxis(null); };
  const spinAll = () => { const r=buildCombo({}); setPicks(r); setComboResult(r); setActiveAxis(null); };

  const logCombo = () => {
    if (!comboResult) return;
    const name = `${comboResult.what} · ${comboResult.where}`;
    setDateHistory([{id:`c_${Date.now()}`,name,date:TODAY_STR,rating:null,axes:comboResult},...dateHistory].slice(0,50));
    showToast("Date logged! 🍷");
    setComboResult(null); setPicks({what:null,where:null,how:null,when:null});
  };

  const addCustomOption = (axis) => {
    const val = addVals[axis].trim();
    if (!val) return;
    const current = axes[axis] || DEFAULT_DATE_AXES[axis];
    if (current.includes(val)) return;
    setDateAxes({...axes,[axis]:[...current,val]});
    setAddVals(v=>({...v,[axis]:""}));
    showToast(`Added to ${AXIS_META[axis].label} options`);
  };

  const removeCustom = (axis, val) => {
    if (DEFAULT_DATE_AXES[axis].includes(val)) return;
    setDateAxes({...axes,[axis]:(axes[axis]||[]).filter(v=>v!==val)});
    if (picks[axis]===val) setPicks(p=>({...p,[axis]:null}));
  };

  const recentIds  = new Set(dateHistory.slice(0,5).map(h=>h.id));
  const browseList = catFilter==="All" ? DATE_IDEAS : DATE_IDEAS.filter(d=>d.category===catFilter);

  return (
    <div>
      <div className="sec-hdr">
        <div className="sec-title">Date <span>Night</span></div>
        <div style={{display:"flex",gap:"8px"}}>
          {[["picker","🎲"],["browse","📋"],["history","📅"]].map(([v,icon])=>(
            <button key={v} className="sec-act" style={{color:view===v?"var(--gold)":"var(--gold-dim)"}} onClick={()=>setView(v)}>
              {icon} {v.charAt(0).toUpperCase()+v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {view==="picker" && (
        <>
          <div className="axis-grid">
            {Object.keys(AXIS_META).map(axis=>{
              const meta=AXIS_META[axis]; const chosen=picks[axis]; const isActive=activeAxis===axis;
              return (
                <div key={axis} style={{gridColumn: isActive?"1/-1":"auto"}}>
                  <div className={`axis-card${isActive?" selected":""}`} onClick={()=>setActiveAxis(isActive?null:axis)}>
                    <div className="axis-label">{meta.icon} {meta.label}</div>
                    <div className={`axis-chosen${chosen?"":" empty"}`}>{chosen||"Tap to pick"}</div>
                    {chosen&&<button onClick={e=>clearAxis(axis,e)} style={{marginTop:"3px",background:"none",border:"none",color:"var(--muted)",fontSize:"10px",cursor:"pointer",fontFamily:"var(--fm)",padding:0}}>✕ clear</button>}
                  </div>
                  {isActive&&(
                    <div style={{background:"var(--surface2)",border:"1px solid var(--gold-dim)",borderRadius:"var(--r)",padding:"12px 13px",marginTop:"6px"}}>
                      <div style={{fontFamily:"var(--fm)",fontSize:"10px",color:"var(--gold-dim)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:"8px"}}>{meta.q}</div>
                      <div className="axis-opts">
                        {(axes[axis]||DEFAULT_DATE_AXES[axis]).map(opt=>(
                          <div key={opt} style={{display:"flex",alignItems:"center",gap:"4px"}}>
                            <button className={`axis-opt${picks[axis]===opt?" on":""}`} onClick={()=>pickAxis(axis,opt)}>{opt}</button>
                            {!DEFAULT_DATE_AXES[axis].includes(opt)&&(
                              <button onClick={()=>removeCustom(axis,opt)} style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:"12px",flexShrink:0}}>✕</button>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="axis-add-row">
                        <input className="axis-add-inp" placeholder="Add your own…" value={addVals[axis]} onChange={e=>setAddVals(v=>({...v,[axis]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addCustomOption(axis)}/>
                        <button className="axis-add-btn" onClick={()=>addCustomOption(axis)}>+ Add</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{display:"flex",gap:"8px",marginBottom:"14px"}}>
            <button className="btn-s" style={{flex:1,padding:"11px"}} onClick={spinAll}>🎲 Full Random</button>
            <button className="btn-p" style={{flex:2,padding:"11px"}} onClick={spin}>🎲 Spin Missing Axes</button>
          </div>

          {comboResult&&(
            <div className="combo-result">
              <div style={{fontFamily:"var(--fm)",fontSize:"10px",color:"var(--gold-dim)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:"12px"}}>Your Date Night</div>
              {Object.keys(AXIS_META).map(axis=>(
                <div key={axis} className="combo-row">
                  <span className="combo-axis-lbl">{AXIS_META[axis].icon} {AXIS_META[axis].label}</span>
                  <span className="combo-axis-val">{comboResult[axis]}</span>
                </div>
              ))}
              <div style={{display:"flex",gap:"8px",marginTop:"12px"}}>
                <button className="btn-s" style={{padding:"8px 14px",fontSize:"11px"}} onClick={spinAll}>Try Again</button>
                <button className="btn-p" style={{flex:1}} onClick={logCombo}>✓ We're Doing This</button>
              </div>
            </div>
          )}

          {dateHistory.length>0&&!comboResult&&(
            <>
              <div className="divider"/>
              <div className="sub-lbl">Recent Dates</div>
              <div style={{display:"flex",flexDirection:"column",gap:"7px"}}>
                {dateHistory.slice(0,3).map((h,i)=>(
                  <div key={i} className="card" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontSize:"14px",color:"var(--cream)",fontWeight:600}}>{h.name}</div>
                      <div style={{fontFamily:"var(--fm)",fontSize:"10px",color:"var(--muted)",marginTop:"2px",letterSpacing:".06em",textTransform:"uppercase"}}>{h.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {view==="browse"&&(
        <>
          <div className="filters">{DATE_CATEGORIES.map(c=><button key={c} className={`chip${catFilter===c?" on":""}`} onClick={()=>setCatFilter(c)}>{c}</button>)}</div>
          <div className="date-list">
            {browseList.map(idea=>(
              <div key={idea.id} className="date-card" onClick={()=>{
                const r={what:idea.name,where:idea.indoor?"Indoors":"Outdoors",how:COST_LABELS[idea.cost]+" budget",when:"whenever works"};
                setPicks(r); setComboResult(r); setView("picker");
              }}>
                <div className="date-cat-dot" style={{background:CAT_COLOR[idea.category]||"var(--muted)"}}/>
                <div className="date-body">
                  <div className="date-name">{idea.name}</div>
                  <div className="date-meta">{idea.category} · {COST_LABELS[idea.cost]} · {idea.indoor?"Indoor":"Outdoor"}</div>
                </div>
                {recentIds.has(idea.id)&&<span style={{fontSize:"10px",color:"var(--muted)",fontFamily:"var(--fm)"}}>recent</span>}
              </div>
            ))}
          </div>
        </>
      )}

      {view==="history"&&(
        <>
          {dateHistory.length===0
            ?<div className="empty"><div className="empty-icon">🍷</div><div className="empty-txt">No dates logged yet.</div></div>
            :<div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {dateHistory.map((h,i)=>(
                <div key={i} className="card">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:"14px",color:"var(--cream)",fontWeight:600,marginBottom:"4px"}}>{h.name}</div>
                      {h.axes&&Object.entries(h.axes).map(([axis,val])=>(
                        <div key={axis} style={{fontSize:"12px",color:"var(--muted)",fontFamily:"var(--fm)",marginTop:"1px"}}>
                          <span style={{color:"var(--gold-dim)"}}>{({what:"🎯",where:"📍",how:"✨",when:"🗓"})[axis]}</span> {val}
                        </div>
                      ))}
                    </div>
                    <div style={{fontFamily:"var(--fm)",fontSize:"10px",color:"var(--muted)",flexShrink:0,marginLeft:"8px"}}>{h.date}</div>
                  </div>
                </div>
              ))}
            </div>
          }
        </>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// GIFT INTEL
// ─────────────────────────────────────────────────────────────────────────────
function AddHintModal({ onAdd, events, onClose }) {
  const [name,setName]=useState(""); const [source,setSource]=useState("she said it"); const [price,setPrice]=useState(""); const [priority,setPri]=useState("med"); const [eventId,setEventId]=useState(""); const [notes,setNotes]=useState(""); const [link,setLink]=useState("");
  const handle=()=>{ if(!name.trim()) return; onAdd({id:Date.now(),name:name.trim(),source,price,priority,eventId:eventId||null,notes,link:link.trim()||null,status:"active",dateLogged:new Date().toISOString().slice(0,10)}); onClose(); };
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="mhandle"/><div className="mtitle">Capture a Hint 💡</div>
        <div className="fgrp"><label className="flbl">What did she hint at?</label><input className="finp" placeholder="e.g. That silk robe at Anthropologie" value={name} onChange={e=>setName(e.target.value)}/></div>
        <div className="fgrp">
          <label className="flbl">How did you catch this?</label>
          <select className="finp" value={source} onChange={e=>setSource(e.target.value)}>
            {["she said it","she showed me","I noticed","she sent a link","she mentioned it more than once"].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
          <div className="fgrp"><label className="flbl">Price Range</label><input className="finp" placeholder="e.g. $50–80" value={price} onChange={e=>setPrice(e.target.value)}/></div>
          <div className="fgrp">
            <label className="flbl">Priority</label>
            <select className="finp" value={priority} onChange={e=>setPri(e.target.value)}>
              <option value="high">🔴 High</option><option value="med">🟡 Medium</option><option value="low">🟢 Low</option>
            </select>
          </div>
        </div>
        <div className="fgrp">
          <label className="flbl">Link to Event (optional)</label>
          <select className="finp" value={eventId} onChange={e=>setEventId(e.target.value)}>
            <option value="">— None —</option>
            {events.map(ev=><option key={ev.id} value={ev.id}>{ev.icon} {ev.name}</option>)}
          </select>
        </div>
        <div className="fgrp"><label className="flbl">Product Link / URL (optional)</label><input className="finp" placeholder="https://…" value={link} onChange={e=>setLink(e.target.value)} type="url"/></div>
        <div className="fgrp"><label className="flbl">Notes</label><textarea className="ftxt" placeholder="Store, context…" value={notes} onChange={e=>setNotes(e.target.value)}/></div>
        <div className="macts"><button className="btn-s" onClick={onClose}>Cancel</button><button className="btn-p" onClick={handle}>Save Hint</button></div>
      </div>
    </div>
  );
}

function GiftIntel({ hints, setHints, events, showToast, onMutate }) {
  const [showAdd,setShowAdd]=useState(false); const [filter,setFilter]=useState("active"); const [showSeeds,setShowSeeds]=useState(false);
  const filtered   = filter==="all"?hints:hints.filter(h=>h.status===filter);
  const statusCycle= {active:"bought",bought:"given",given:"active"};
  const statusLabel= {active:"💡 Active",bought:"✅ Bought",given:"🎁 Given"};
  const priColor   = {high:"var(--red)",med:"var(--gold)",low:"var(--muted)"};
  const cycleStatus= id => { setHints(hints.map(h=>h.id===id?{...h,status:statusCycle[h.status]}:h)); onMutate(); };
  const linkedEvent= (eventId) => events.find(e=>String(e.id)===String(eventId));
  return (
    <div>
      {showAdd&&<AddHintModal onAdd={h=>{setHints([h,...hints]);showToast("Hint captured! 💡");onMutate();}} events={events} onClose={()=>setShowAdd(false)}/>}
      <div className="sec-hdr"><div className="sec-title">Gift <span>Intel</span></div><button className="sec-act" onClick={()=>setShowAdd(true)}>+ Capture</button></div>
      <div className="filters">{[["active","💡 Active"],["bought","✅ Bought"],["given","🎁 Given"],["all","All"]].map(([v,l])=>(
        <button key={v} className={`chip${filter===v?" on":""}`} onClick={()=>setFilter(v)}>{l}</button>
      ))}</div>
      {filtered.length===0
        ? <div className="empty"><div className="empty-icon">💡</div><div className="empty-txt">{filter==="active"?"No active hints. Capture one above.":"Nothing here."}</div></div>
        : <div className="hint-list">{filtered.map(hint=>{
            const ev=hint.eventId?linkedEvent(hint.eventId):null;
            return (
              <div key={hint.id} className="hint-card">
                <div className="hint-pri" style={{background:priColor[hint.priority]||"var(--muted)"}}/>
                <div className="hint-body">
                  <div className="hint-name">{hint.name}</div>
                  <div className="hint-meta">
                    <span className="hint-tag ht-source">{hint.source}</span>
                    {hint.price&&<span className="hint-tag ht-price">{hint.price}</span>}
                    {ev&&<span className="hint-tag ht-event">{ev.icon} {ev.name}</span>}
                    {hint.link&&<a href={hint.link} target="_blank" rel="noopener noreferrer" className="hint-tag ht-idea" style={{textDecoration:"none"}}>🔗 link</a>}
                    {hint.notes&&<span className="hint-tag ht-idea" title={hint.notes}>💬 note</span>}
                  </div>
                  <div style={{marginTop:"6px",display:"flex",alignItems:"center",gap:"8px"}}>
                    <button className={`hint-status-btn${hint.status==="active"?" hs-active":hint.status==="bought"?" hs-bought":" hs-given"}`} onClick={()=>cycleStatus(hint.id)}>
                      {statusLabel[hint.status]} →
                    </button>
                    <span style={{fontSize:"11px",color:"var(--muted)",fontFamily:"var(--fm)"}}>{hint.dateLogged}</span>
                  </div>
                </div>
              </div>
            );
          })}</div>
      }
      <div className="divider"/>
      <button className="btn-f btn-exp" onClick={()=>setShowSeeds(!showSeeds)}>{showSeeds?"▲ Hide":"▼ Show"} Gift Idea Inspiration</button>
      {showSeeds&&<div className="seeds-grid">{GIFT_SEEDS.map(cat=>(
        <div key={cat.category} className="seed-card">
          <div className="seed-cat">{cat.category}</div>
          {cat.ideas.slice(0,3).map((idea,i)=><div key={i} className="seed-item">{idea}</div>)}
        </div>
      ))}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPLIMENT ENGINE
// ─────────────────────────────────────────────────────────────────────────────
function ComplimentEngine({ compHistory, setCompHistory, customComps, setCustomComps, showToast, onMutate }) {
  const [catFilter,  setCatFilter]  = useState("All");
  const [view,       setView]       = useState("daily");   // daily | library | history | stats
  const [showAddBox, setShowAddBox] = useState(false);
  const [newText,    setNewText]    = useState("");
  const [newCat,     setNewCat]     = useState("Present");
  const [refreshed,  setRefreshed]  = useState(false);     // cooldown flag per session

  // Daily pick: deterministic from date, but overridable via stored daily state
  const todayKey = TODAY_STR;
  const todayEntry = compHistory.find(h => h.date === todayKey);
  const allComps   = [...COMPLIMENT_LIBRARY, ...customComps];

  const pickDaily = (forceNew = false) => {
    if (forceNew) {
      // pick one not delivered today, random
      const used = new Set(compHistory.filter(h=>h.date===todayKey).map(h=>h.id));
      const pool = allComps.filter(c=>!used.has(c.id));
      return pool.length > 0
        ? pool[Math.floor(Math.random()*pool.length)]
        : allComps[Math.floor(Math.random()*allComps.length)];
    }
    // deterministic: day-of-year mod library length
    const doy = Math.floor((new Date()-new Date(new Date().getFullYear(),0,0))/86400000);
    return allComps[doy % allComps.length];
  };

  const [daily, setDaily] = useState(() => {
    if (todayEntry) return allComps.find(c=>c.id===todayEntry.id) || pickDaily();
    return pickDaily();
  });

  const handleDeliver = () => {
    if (todayEntry) return; // already delivered today
    const entry = { id:daily.id, cat:daily.cat, text:daily.text, date:todayKey, rating:null, delivered:true };
    setCompHistory([entry, ...compHistory].slice(0,30));
    onMutate();
    showToast("Compliment marked delivered 💬");
  };

  const handleRefresh = () => {
    if (refreshed) return;
    const next = pickDaily(true);
    setDaily(next);
    setRefreshed(true);
  };

  const rateCompliment = (id, rating) => {
    setCompHistory(compHistory.map(h => h.id===id && h.date===todayKey ? {...h, rating} : h));
    onMutate();
  };

  const rateHistoric = (date, id, rating) => {
    setCompHistory(compHistory.map(h => h.id===id && h.date===date ? {...h, rating} : h));
    onMutate();
  };

  const addCustom = () => {
    if (!newText.trim()) return;
    const c = { id:`cu_${Date.now()}`, cat:newCat, text:newText.trim(), custom:true };
    setCustomComps([c, ...customComps]);
    setNewText(""); setShowAddBox(false);
    onMutate();
    showToast("Compliment added to library 💬");
  };

  // Stats
  const rated    = compHistory.filter(h=>h.rating);
  const catScores= {};
  COMPLIMENT_CATS.filter(c=>c!=="All").forEach(c=>{
    const items = rated.filter(h=>h.cat===c);
    catScores[c] = items.length ? (items.reduce((s,h)=>s+h.rating,0)/items.length).toFixed(1) : null;
  });
  const bestCat = Object.entries(catScores).filter(([,v])=>v).sort((a,b)=>b[1]-a[1])[0];

  const filteredLib = catFilter==="All" ? allComps : allComps.filter(c=>c.cat===catFilter);
  const isDeliveredToday = !!todayEntry;
  const REACTIONS = ["","😐","🙂","😊","😍"];

  return (
    <div>
      <div className="sec-hdr">
        <div className="sec-title">Compliment <span>Engine</span></div>
        <div style={{display:"flex",gap:"8px"}}>
          {["daily","library","history","stats"].map(v=>(
            <button key={v} className="sec-act" style={{color:view===v?"var(--gold)":"var(--gold-dim)"}} onClick={()=>setView(v)}>
              {v.charAt(0).toUpperCase()+v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── DAILY VIEW ── */}
      {view==="daily" && (
        <>
          <div className="comp-daily">
            <div className="comp-daily-lbl">
              Today's Compliment
              <span className="comp-cat-pill">{daily.cat}</span>
            </div>
            <div className="comp-text">"{daily.text}"</div>
            <div className="comp-actions">
              <button
                className={`comp-deliver-btn${isDeliveredToday?" done":""}`}
                onClick={handleDeliver}
                disabled={isDeliveredToday}
              >
                {isDeliveredToday ? "✓ Delivered" : "Mark Delivered"}
              </button>
              <button className="comp-refresh-btn" onClick={handleRefresh} disabled={refreshed}>
                {refreshed?"Refreshed ✓":"🔀 New One"}
              </button>
            </div>
          </div>

          {/* Rate today's reaction */}
          {isDeliveredToday && (
            <div className="card" style={{marginBottom:"12px"}}>
              <div className="sub-lbl" style={{marginBottom:"8px"}}>Her Reaction?</div>
              <div className="comp-rating" style={{justifyContent:"center",gap:"12px"}}>
                {[1,2,3,4].map(r=>(
                  <button key={r} className={`comp-star${todayEntry.rating===r?" on":""}`}
                    onClick={()=>rateCompliment(daily.id,r)}
                    style={{fontSize:"28px",background:"none",border:"none",cursor:"pointer"}}>
                    {REACTIONS[r]}
                  </button>
                ))}
              </div>
              {todayEntry.rating && (
                <div style={{textAlign:"center",marginTop:"8px",fontSize:"13px",color:"var(--cream-dim)",fontStyle:"italic"}}>
                  {todayEntry.rating===4?"She loved it. 💕":todayEntry.rating===3?"She smiled. Good one.":todayEntry.rating===2?"Landed okay — keep going.":"Keep trying. Tomorrow's another shot."}
                </div>
              )}
            </div>
          )}

          <div style={{padding:"10px 12px",background:"var(--surface2)",border:"1px solid var(--border2)",borderRadius:"var(--r)",fontSize:"13px",color:"var(--cream-dim)",lineHeight:"1.5",fontStyle:"italic"}}>
            💡 A new compliment appears each day. Hit "Mark Delivered" after you say it — then rate her reaction to track what lands best.
          </div>
        </>
      )}

      {/* ── LIBRARY VIEW ── */}
      {view==="library" && (
        <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
            <div style={{fontSize:"12px",color:"var(--muted)",fontFamily:"var(--fm)"}}>{filteredLib.length} compliments</div>
            <button className="sec-act" onClick={()=>setShowAddBox(!showAddBox)}>+ Add Custom</button>
          </div>

          {showAddBox && (
            <div className="comp-add-box">
              <div className="comp-add-title">Write Your Own</div>
              <div className="fgrp">
                <textarea className="ftxt" placeholder="Write something specific and real…" value={newText} onChange={e=>setNewText(e.target.value)} style={{minHeight:"72px"}}/>
              </div>
              <div className="fgrp">
                <label className="flbl">Category</label>
                <select className="finp" value={newCat} onChange={e=>setNewCat(e.target.value)}>
                  {COMPLIMENT_CATS.filter(c=>c!=="All").map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="macts" style={{marginTop:"8px"}}>
                <button className="btn-s" onClick={()=>setShowAddBox(false)}>Cancel</button>
                <button className="btn-p" disabled={!newText.trim()} onClick={addCustom}>Save</button>
              </div>
            </div>
          )}

          <div className="filters">
            {COMPLIMENT_CATS.map(c=><button key={c} className={`chip${catFilter===c?" on":""}`} onClick={()=>setCatFilter(c)}>{c}</button>)}
          </div>

          <div className="comp-list">
            {filteredLib.map(c=>(
              <div key={c.id} className="comp-card">
                <div className="comp-card-top">
                  <div className="comp-card-text">"{c.text}"</div>
                </div>
                <div className="comp-card-meta">
                  <span className="comp-cat-pill">{c.cat}</span>
                  {c.custom && <span style={{fontFamily:"var(--fm)",fontSize:"9px",color:"var(--green-tx)"}}>custom</span>}
                  {customComps.find(cc=>cc.id===c.id) && (
                    <button onClick={()=>{setCustomComps(customComps.filter(cc=>cc.id!==c.id));onMutate();showToast("Removed.");}}
                      style={{background:"none",border:"none",color:"rgba(192,57,43,.5)",fontSize:"11px",cursor:"pointer",fontFamily:"var(--fm)"}}>✕ remove</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── HISTORY VIEW ── */}
      {view==="history" && (
        <>
          <div style={{fontSize:"12px",color:"var(--muted)",fontFamily:"var(--fm)",marginBottom:"10px"}}>{compHistory.length} delivered</div>
          {compHistory.length===0
            ? <div className="empty"><div className="empty-icon">💬</div><div className="empty-txt">No compliments delivered yet.</div></div>
            : <div className="comp-list">
                {compHistory.map((h,i)=>(
                  <div key={i} className="comp-card">
                    <div className="comp-card-top">
                      <div className="comp-card-text">"{h.text}"</div>
                    </div>
                    <div className="comp-card-meta">
                      <span className="comp-cat-pill">{h.cat}</span>
                      <span className="comp-hist-date">{h.date}</span>
                    </div>
                    <div style={{marginTop:"8px"}}>
                      <div style={{fontSize:"10px",color:"var(--muted)",fontFamily:"var(--fm)",marginBottom:"4px",letterSpacing:".06em",textTransform:"uppercase"}}>Her reaction</div>
                      <div className="comp-rating">
                        {[1,2,3,4].map(r=>(
                          <button key={r} className={`comp-star${h.rating===r?" on":""}`}
                            onClick={()=>rateHistoric(h.date,h.id,r)}
                            style={{fontSize:"20px",background:"none",border:"none",cursor:"pointer"}}>
                            {REACTIONS[r]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          }
        </>
      )}

      {/* ── STATS VIEW ── */}
      {view==="stats" && (
        <>
          <div className="comp-grid">
            <div className="comp-stat"><div className="comp-stat-val">{compHistory.length}</div><div className="comp-stat-lbl">Delivered</div></div>
            <div className="comp-stat"><div className="comp-stat-val">{rated.length}</div><div className="comp-stat-lbl">Rated</div></div>
            <div className="comp-stat"><div className="comp-stat-val">{customComps.length}</div><div className="comp-stat-lbl">Custom</div></div>
          </div>

          {bestCat && (
            <div style={{padding:"10px 14px",background:"var(--rose-bg)",border:"1px solid var(--rose-bd)",borderRadius:"var(--r)",marginBottom:"12px",fontSize:"14px",color:"var(--rose-tx)"}}>
              💕 <strong>{bestCat[0]}</strong> compliments land best with her — avg {bestCat[1]} / 4.
            </div>
          )}

          <div className="sub-lbl">Avg Reaction by Category</div>
          <div style={{display:"flex",flexDirection:"column",gap:"7px",marginBottom:"16px"}}>
            {COMPLIMENT_CATS.filter(c=>c!=="All").map(cat=>{
              const items = rated.filter(h=>h.cat===cat);
              const avg   = items.length ? items.reduce((s,h)=>s+h.rating,0)/items.length : 0;
              return (
                <div key={cat} style={{display:"flex",alignItems:"center",gap:"10px"}}>
                  <span style={{fontFamily:"var(--fm)",fontSize:"10px",color:"var(--muted)",width:"90px",letterSpacing:".05em",textTransform:"uppercase",flexShrink:0}}>{cat}</span>
                  <div style={{flex:1,height:"5px",background:"var(--surface3)",borderRadius:"3px",overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${(avg/4)*100}%`,background:"linear-gradient(90deg,var(--rose-bd),var(--rose-tx))",borderRadius:"3px",transition:"width .5s"}}/>
                  </div>
                  <span style={{fontFamily:"var(--fd)",fontSize:"13px",color:"var(--gold)",width:"28px",textAlign:"right"}}>{avg?avg.toFixed(1):"—"}</span>
                </div>
              );
            })}
          </div>

          <div style={{fontSize:"12px",color:"var(--muted)",fontStyle:"italic",lineHeight:"1.5"}}>
            Rate each compliment after delivery to build your personal stats. The more data, the more useful this gets.
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function CreateOfferModal({ onSend, points, events, onClose }) {
  const [type,    setType]    = useState(null);
  const [title,   setTitle]   = useState("");
  const [msg,     setMsg]     = useState("");
  const [ask,     setAsk]     = useState("");
  const [ptMode,  setPtMode]  = useState("none");  // "earn" | "spend" | "none"
  const [ptAmt,   setPtAmt]   = useState("");
  const [generated,setGen]    = useState(null);

  const generate = () => {
    if (!title.trim()||!type) return;
    const ptTx = ptMode!=="none"&&ptAmt ? { mode:ptMode, amount:Math.abs(parseInt(ptAmt,10)||0) } : null;
    const offer = {
      id: Date.now().toString(36), type, title:title.trim(), message:msg.trim(), ask:ask.trim(),
      from:"Your Husband 😏", points, ptTx,
      createdAt:new Date().toISOString(),
      expiresAt:new Date(Date.now()+7*86400000).toISOString(), status:"pending",
    };
    const url = buildOfferUrl(offer);
    setGen({ offer, url });
    onSend({ ...offer, url });
  };

  const copy = () => { navigator.clipboard?.writeText(generated.url); };
  const sms  = () => { window.open(`sms:?&body=${encodeURIComponent("I have a proposal for you 😏 " + generated.url)}`); };

  const PT_HELP = {
    earn:  "You earn these points when she accepts",
    spend: "These points are deducted from your balance when she accepts",
    none:  "No point transaction attached to this offer",
  };

  return (
    <div className="overlay" onClick={!generated?onClose:undefined}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="mhandle"/>
        <div className="mtitle">{generated?"Your Offer is Ready 📨":"Create an Offer"}</div>
        {!generated && (
          <>
            {!type && (
              <>
                <div className="flbl" style={{marginBottom:"10px"}}>What kind of offer?</div>
                <div className="offer-types">{OFFER_TYPES.map(ot=>(
                  <div key={ot.id} className="offer-type-btn" onClick={()=>setType(ot.id)}>
                    <div className="offer-type-icon">{ot.icon}</div>
                    <div className="offer-type-lbl">{ot.label}</div>
                    <div className="offer-type-desc">{ot.desc}</div>
                  </div>
                ))}</div>
              </>
            )}
            {type && (
              <>
                <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"14px"}}>
                  <span style={{fontSize:"20px"}}>{OFFER_TYPES.find(o=>o.id===type)?.icon}</span>
                  <span style={{fontFamily:"var(--fm)",fontSize:"11px",color:"var(--gold-dim)",letterSpacing:".08em",textTransform:"uppercase"}}>{OFFER_TYPES.find(o=>o.id===type)?.label}</span>
                  <button onClick={()=>setType(null)} style={{marginLeft:"auto",background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontFamily:"var(--fm)",fontSize:"10px"}}>Change ↩</button>
                </div>
                <div className="fgrp"><label className="flbl">Offer Title</label><input className="finp" placeholder={type==="chore"?"e.g. I'll deep clean the garage":"e.g. Dinner Saturday night — I plan everything"} value={title} onChange={e=>setTitle(e.target.value)}/></div>
                <div className="fgrp"><label className="flbl">Your Message to Her</label><textarea className="ftxt" placeholder="Add a personal note…" value={msg} onChange={e=>setMsg(e.target.value)}/></div>
                <div className="fgrp"><label className="flbl">What You're Asking For (optional)</label><textarea className="ftxt" placeholder={type==="chore"?"e.g. A back rub added to the reward store":""} value={ask} onChange={e=>setAsk(e.target.value)}/></div>

                {/* Point transaction */}
                <div className="fgrp">
                  <label className="flbl">Point Transaction (optional)</label>
                  <div className="opt-pts-row">
                    <button className={`opt-pts-btn earn${ptMode==="earn"?" on":""}`} onClick={()=>setPtMode("earn")}>⬆ I Earn</button>
                    <button className={`opt-pts-btn spend${ptMode==="spend"?" on":""}`} onClick={()=>setPtMode("spend")}>⬇ I Spend</button>
                    <button className={`opt-pts-btn none${ptMode==="none"?" on":""}`} onClick={()=>setPtMode("none")}>— None</button>
                  </div>
                  {ptMode!=="none" && (
                    <div style={{display:"flex",gap:"8px",alignItems:"center",marginTop:"6px"}}>
                      <input className="finp" type="number" min="1" placeholder="Points" value={ptAmt} onChange={e=>setPtAmt(e.target.value)} style={{width:"100px"}}/>
                      <span style={{fontSize:"12px",color:"var(--muted)",lineHeight:"1.4"}}>{PT_HELP[ptMode]}</span>
                    </div>
                  )}
                  {ptMode==="none"&&<div style={{fontSize:"11px",color:"var(--muted)",marginTop:"4px",fontFamily:"var(--fm)"}}>{PT_HELP.none}</div>}
                </div>

                <div style={{padding:"9px 11px",background:"var(--surface2)",border:"1px solid var(--border2)",borderRadius:"var(--r)",fontSize:"12px",color:"var(--muted)",marginBottom:"14px"}}>
                  Your point balance of <strong style={{color:"var(--gold)"}}>{points} pts</strong> will be visible to her in the offer.
                </div>
                <div className="macts"><button className="btn-s" onClick={onClose}>Cancel</button><button className="btn-p" disabled={!title.trim()} onClick={generate}>Generate Offer Link</button></div>
              </>
            )}
          </>
        )}
        {generated && (
          <>
            <div style={{padding:"12px 14px",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:"var(--r)",marginBottom:"14px"}}>
              <div style={{fontFamily:"var(--fm)",fontSize:"10px",color:"var(--gold-dim)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:"6px"}}>Offer Summary</div>
              <div style={{fontSize:"15px",fontWeight:600,color:"var(--cream)",marginBottom:"4px"}}>{generated.offer.title}</div>
              {generated.offer.message&&<div style={{fontSize:"13px",color:"var(--cream-dim)",fontStyle:"italic",marginBottom:"4px"}}>"{generated.offer.message}"</div>}
              {generated.offer.ask&&<div style={{fontSize:"12px",color:"var(--muted)",marginBottom:"6px"}}>In exchange for: {generated.offer.ask}</div>}
              {generated.offer.ptTx&&(
                <span className={`pts-tx-badge${generated.offer.ptTx.mode==="earn"?" ptx-earn":" ptx-spend"}`}>
                  {generated.offer.ptTx.mode==="earn"?"⬆":"⬇"} {generated.offer.ptTx.amount} pts on acceptance
                </span>
              )}
            </div>
            <div className="token-box">
              <div className="token-lbl">Shareable Offer Link</div>
              <div className="token-val">{generated.url.slice(0,60)}…</div>
              <div className="token-actions">
                <button className="btn-s" style={{flex:1,padding:"8px",fontSize:"10px"}} onClick={copy}>📋 Copy Link</button>
                <button className="btn-rose btn-f" style={{flex:1,margin:0,padding:"8px",fontSize:"10px"}} onClick={sms}>💬 Send via Text</button>
              </div>
            </div>
            <div style={{fontSize:"12px",color:"var(--muted)",marginTop:"10px",lineHeight:"1.5",fontStyle:"italic"}}>
              She opens this link in her browser — no app needed. Expires in 7 days.
            </div>
            <div className="macts"><button className="btn-p" onClick={onClose}>Done</button></div>
          </>
        )}
      </div>
    </div>
  );
}

function Offers({ offers, setOffers, points, setPoints, taskHistory, setTaskHistory, events, showToast }) {
  const [showCreate,  setShowCreate]  = useState(false);
  const [pasteToken,  setPasteToken]  = useState("");
  const [decoded,     setDecoded]     = useState(null);
  const [decodeErr,   setDecodeErr]   = useState("");
  const statusClass = {pending:"os-pending",accepted:"os-accepted",declined:"os-declined",countered:"os-countered"};
  const offerType   = id => OFFER_TYPES.find(o=>o.id===id)||OFFER_TYPES[3];
  const handleSend  = offer => { setOffers([offer,...offers]); showToast("Offer created! Send her the link 📨"); };

  const handleDecode = () => {
    setDecodeErr(""); setDecoded(null);
    const resp = decodeToken(pasteToken);
    if (!resp || !resp.offerId || !resp.status) { setDecodeErr("Invalid response token. Make sure you copied the full token from her."); return; }
    setDecoded(resp);
  };

  const applyResponse = () => {
    if (!decoded) return;
    const offer = offers.find(o=>o.id===decoded.offerId);
    const updatedOffers = offers.map(o =>
      o.id===decoded.offerId ? {...o,status:decoded.status,herReply:decoded.reply||"",respondedAt:decoded.at} : o
    );
    setOffers(updatedOffers);

    // Auto-apply point transaction if accepted
    if (decoded.status==="accepted" && offer?.ptTx && offer.ptTx.amount > 0) {
      const tx = offer.ptTx;
      const delta = tx.mode==="earn" ? +tx.amount : -tx.amount;
      const newPts = Math.max(0, points + delta);
      setPoints(newPts);
      const histEntry = {
        id: `offer_${offer.id}`, name:`Offer: ${offer.title}`,
        date: TODAY_STR, pts: Math.abs(delta),
        bonuses: [], source:"offer",
        txMode: tx.mode,
      };
      setTaskHistory([histEntry, ...taskHistory].slice(0,50));
      showToast(`Offer accepted! ${tx.mode==="earn"?"+":"−"}${tx.amount} pts applied 📨`);
    } else {
      showToast(`Offer updated: ${decoded.status} 📨`);
    }
    setPasteToken(""); setDecoded(null);
  };

  const STATUS_ICONS = { accepted:"✅", declined:"❌", countered:"💬" };

  return (
    <div>
      {showCreate&&<CreateOfferModal onSend={handleSend} points={points} events={events} onClose={()=>setShowCreate(false)}/>}
      <div className="sec-hdr"><div className="sec-title"><span>Offer</span> Inbox</div><button className="sec-act" onClick={()=>setShowCreate(true)}>+ New Offer</button></div>

      <div style={{padding:"10px 12px",background:"var(--surface2)",border:"1px solid var(--border2)",borderRadius:"var(--r)",marginBottom:"14px",fontSize:"13px",color:"var(--cream-dim)",lineHeight:"1.5"}}>
        Create a proposal — she responds in her browser via the link. No app needed on her end.
      </div>

      {/* Response paste box */}
      <div className="resp-paste-box" style={{marginBottom:"14px"}}>
        <div className="resp-paste-lbl">📬 Paste Her Response Token</div>
        <div style={{fontSize:"12px",color:"var(--muted)",marginBottom:"8px",lineHeight:"1.4"}}>
          When she responds via the offer link, she'll see a token to send back. Paste it here to update the offer.
        </div>
        <textarea
          className="ftxt"
          placeholder="Paste her response token here…"
          value={pasteToken}
          onChange={e=>{setPasteToken(e.target.value);setDecoded(null);setDecodeErr("");}}
          style={{minHeight:"52px",fontSize:"12px"}}
        />
        {decodeErr && <div style={{fontSize:"12px",color:"var(--red)",marginTop:"4px"}}>{decodeErr}</div>}

        {decoded && (
          <div className="resp-decoded">
            <div style={{fontFamily:"var(--fm)",fontSize:"10px",letterSpacing:".1em",textTransform:"uppercase",marginBottom:"6px",
              color: decoded.status==="accepted"?"var(--green-tx)":decoded.status==="declined"?"#e07070":"var(--blue-tx)"}}>
              {STATUS_ICONS[decoded.status]} She {decoded.status} your offer
            </div>
            {decoded.reply && <div style={{fontSize:"13px",color:"var(--cream-dim)",fontStyle:"italic",lineHeight:"1.4",marginBottom:"8px"}}>"{decoded.reply}"</div>}
            <button className="btn-p" style={{width:"100%",padding:"9px"}} onClick={applyResponse}>Apply to Offer</button>
          </div>
        )}

        {!decoded && pasteToken.trim() && (
          <button className="btn-imp btn-f" style={{marginTop:"6px",marginBottom:"0"}} onClick={handleDecode}>Decode Response</button>
        )}
      </div>

      {offers.length===0
        ? <div className="empty"><div className="empty-icon">📨</div><div className="empty-txt">No offers yet. Create one above.</div></div>
        : <div>{offers.map(offer=>{
            const ot=offerType(offer.type);
            return (
              <div key={offer.id} className="offer-card">
                <div className="offer-top">
                  <div className="offer-icon">{ot.icon}</div>
                  <div className="offer-body">
                    <div className="offer-title">{offer.title}</div>
                    {offer.message&&<div className="offer-msg">"{offer.message}"</div>}
                    {offer.ask&&<div style={{fontSize:"12px",color:"var(--muted)",marginBottom:"6px"}}>Asking for: {offer.ask}</div>}
                    <div className="offer-meta">
                      <span className={`offer-status ${statusClass[offer.status]||"os-pending"}`}>{offer.status}</span>
                      <span style={{fontFamily:"var(--fm)",fontSize:"10px",color:"var(--muted)"}}>{new Date(offer.createdAt).toLocaleDateString()}</span>
                      {offer.ptTx&&offer.ptTx.amount>0&&(
                        <span className={`pts-tx-badge${offer.ptTx.mode==="earn"?" ptx-earn":" ptx-spend"}`}>
                          {offer.ptTx.mode==="earn"?"⬆":"⬇"} {offer.ptTx.amount} pts
                        </span>
                      )}
                    </div>
                    {offer.herReply && (
                      <div style={{marginTop:"8px",padding:"8px 10px",background:"var(--surface2)",borderRadius:"var(--r)",fontSize:"13px",color:"var(--cream-dim)",fontStyle:"italic",borderLeft:"2px solid var(--rose-bd)"}}>
                        Her reply: "{offer.herReply}"
                      </div>
                    )}
                    {offer.url&&<div className="token-box" style={{marginTop:"8px"}}>
                      <div className="token-lbl">Offer Link</div>
                      <div className="token-val">{offer.url.slice(0,55)}…</div>
                      <div className="token-actions">
                        <button className="btn-s" style={{flex:1,padding:"6px",fontSize:"9px"}} onClick={()=>navigator.clipboard?.writeText(offer.url)}>📋 Copy</button>
                        <button className="btn-rose btn-f" style={{flex:1,margin:0,padding:"6px",fontSize:"9px"}} onClick={()=>window.open(`sms:?&body=${encodeURIComponent("My proposal: "+offer.url)}`)}>💬 Text</button>
                      </div>
                    </div>}
                  </div>
                </div>
              </div>
            );
          })}</div>
      }
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HER WORLD
// ─────────────────────────────────────────────────────────────────────────────
function HerWorld({ herProfile, setHerProfile, showToast, onMutate }) {
  const [draft, setDraft] = useState({ ...herProfile });
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  const save = () => {
    setHerProfile(draft);
    onMutate();
    setSaved(true);
    showToast("Her World saved 🌹");
    setTimeout(() => setSaved(false), 2000);
  };

  const Field = ({ label, k, placeholder, full }) => (
    <div className={`hw-field${full?" full":""}`}>
      <label className="flbl">{label}</label>
      <input className="finp" placeholder={placeholder||""} value={draft[k]||""} onChange={e=>set(k,e.target.value)}/>
    </div>
  );

  const TextareaField = ({ label, k, placeholder }) => (
    <div className="hw-field full">
      <label className="flbl">{label}</label>
      <textarea className="ftxt" placeholder={placeholder||""} value={draft[k]||""} onChange={e=>set(k,e.target.value)}/>
    </div>
  );

  return (
    <div>
      <div className="sec-hdr">
        <div className="sec-title">Her <span>World</span></div>
        <button className="sec-act" onClick={save}>{saved?"Saved ✓":"Save Changes"}</button>
      </div>

      <div style={{padding:"9px 12px",background:"var(--rose-bg)",border:"1px solid var(--rose-bd)",borderRadius:"var(--r)",marginBottom:"16px",fontSize:"13px",color:"var(--rose-tx)",lineHeight:"1.5"}}>
        Everything you know about her — sizes, preferences, her people. Private and local. Never leaves your device.
      </div>

      {/* Identity */}
      <div className="hw-section">
        <div className="hw-section-title">👤 Identity</div>
        <div className="hw-grid">
          <Field label="Her Name" k="name" placeholder="Full name"/>
          <Field label="Nickname" k="nickname" placeholder="What you call her"/>
          <Field label="Birthday" k="birthday" placeholder="e.g. March 22"/>
          <div/>
        </div>
      </div>

      <div className="divider"/>

      {/* Love Language */}
      <div className="hw-section">
        <div className="hw-section-title">💕 Love Language</div>
        <div className="hw-ll-opts">
          {LOVE_LANGUAGES.map(ll=>(
            <button key={ll} className={`hw-ll-btn${draft.loveLanguage===ll?" on":""}`} onClick={()=>set("loveLanguage",ll)}>
              {ll}
              {ll==="Words of Affirmation"&&<span style={{fontSize:"11px",color:"inherit",marginLeft:"6px",opacity:.7}}>— compliments, verbal praise</span>}
              {ll==="Acts of Service"&&<span style={{fontSize:"11px",color:"inherit",marginLeft:"6px",opacity:.7}}>— doing things for her</span>}
              {ll==="Receiving Gifts"&&<span style={{fontSize:"11px",color:"inherit",marginLeft:"6px",opacity:.7}}>— thoughtful presents</span>}
              {ll==="Quality Time"&&<span style={{fontSize:"11px",color:"inherit",marginLeft:"6px",opacity:.7}}>— undivided attention</span>}
              {ll==="Physical Touch"&&<span style={{fontSize:"11px",color:"inherit",marginLeft:"6px",opacity:.7}}>— contact, closeness</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="divider"/>

      {/* Sizes */}
      <div className="hw-section">
        <div className="hw-section-title">👗 Sizes</div>
        <div className="hw-grid">
          <Field label="Clothing Size" k="clothingSize" placeholder="e.g. S, M, 6"/>
          <Field label="Shoe Size" k="shoeSize" placeholder="e.g. 7.5"/>
          <Field label="Ring Size" k="ringSize" placeholder="e.g. 6"/>
          <div/>
        </div>
      </div>

      <div className="divider"/>

      {/* Preferences */}
      <div className="hw-section">
        <div className="hw-section-title">⭐ Her Favorites</div>
        <div className="hw-grid">
          <Field label="Favorite Color"      k="favColor"      placeholder=""/>
          <Field label="Favorite Flower"     k="favFlower"     placeholder=""/>
          <Field label="Favorite Restaurant" k="favRestaurant" placeholder="" full/>
          <Field label="Favorite Drink"      k="favDrink"      placeholder=""/>
          <Field label="Favorite Snack"      k="favSnack"      placeholder=""/>
          <Field label="Favorite Movie"      k="favMovie"      placeholder="" full/>
          <Field label="Favorite Show"       k="favShow"       placeholder="" full/>
          <Field label="Favorite Artist / Band" k="favArtist"  placeholder="" full/>
          <Field label="Favorite Book"       k="favBook"       placeholder="" full/>
        </div>
      </div>

      <div className="divider"/>

      {/* Her People */}
      <div className="hw-section">
        <div className="hw-section-title">👥 Her People</div>
        <div className="hw-grid">
          <Field label="Best Friend"    k="bestFriend"   placeholder=""/>
          <Field label="Mom's Name"     k="momName"      placeholder=""/>
          <Field label="Dad's Name"     k="dadName"      placeholder=""/>
          <Field label="Siblings"       k="siblingNames" placeholder="Names" full/>
        </div>
      </div>

      <div className="divider"/>

      {/* Notes */}
      <div className="hw-section">
        <div className="hw-section-title">📝 Notes & Quirks</div>
        <div className="hw-grid">
          <TextareaField label="Allergies / Food restrictions" k="allergies" placeholder="Anything to never forget…"/>
          <TextareaField label="Things she dislikes"           k="dislikes"  placeholder="Avoid these…"/>
          <TextareaField label="Quirks & things that matter"   k="quirks"    placeholder="Little things only you know…"/>
          <TextareaField label="Other notes"                   k="notes"     placeholder="Anything else…"/>
        </div>
      </div>

      <button className="hw-save-btn" onClick={save}>{saved?"✓ Saved":"Save Her World"}</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEV TOOLKIT (inside Settings, behind Dev Mode toggle)
// ─────────────────────────────────────────────────────────────────────────────
function DevToolkit({ bugLog, setBugLog, sessionNotes, setSessionNotes, appState, showToast }) {
  const [view,       setView]     = useState("map");   // map | bugs | notes | handoff
  const [copiedId,   setCopied]   = useState(null);
  const [bugComp,    setBugComp]  = useState("");
  const [bugExpect,  setBugExpect]= useState("");
  const [bugActual,  setBugActual]= useState("");
  const [bugSev,     setBugSev]   = useState("functional");

  const copyComp = id => {
    navigator.clipboard?.writeText(`[${id}]`).catch(()=>{});
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
    showToast(`Copied [${id}]`);
  };

  const submitBug = () => {
    if (!bugComp.trim() || !bugActual.trim()) return;
    const num = bugLog.length + 1;
    const id  = `BUG-${String(num).padStart(3,"0")}`;
    const entry = {
      id, component: bugComp.trim(),
      expected: bugExpect.trim(), actual: bugActual.trim(),
      severity: bugSev, status: "open",
      date: TODAY_STR,
    };
    setBugLog([entry, ...bugLog]);
    setBugComp(""); setBugExpect(""); setBugActual(""); setBugSev("functional");
    showToast(`${id} logged 🐛`);
  };

  const toggleBugStatus = id => {
    setBugLog(bugLog.map(b => b.id===id ? {...b, status: b.status==="open"?"resolved":"open"} : b));
  };

  const deleteBug = id => {
    setBugLog(bugLog.filter(b => b.id!==id));
    showToast("Bug removed.");
  };

  // Handoff export text
  const openBugs     = bugLog.filter(b=>b.status==="open");
  const resolvedBugs = bugLog.filter(b=>b.status==="resolved");
  const handoffText  = [
    `=== HAPPY WIFE DEV HANDOFF — ${TODAY_STR} ===`,
    `Version: v${appState.version||"0.6.0"}`,
    ``,
    openBugs.length > 0 ? [
      `OPEN BUGS (${openBugs.length}):`,
      ...openBugs.map(b => `  ${b.id} [${b.severity.toUpperCase()}] [${b.component}]\n  Expected: ${b.expected||"—"}\n  Actual: ${b.actual}`),
    ].join("\n") : "OPEN BUGS: None",
    ``,
    sessionNotes.trim() ? `SESSION NOTES:\n${sessionNotes}` : "SESSION NOTES: None",
    ``,
    `DATA SNAPSHOT:`,
    `  Tasks: ${appState.tasks?.length||0} (${appState.tasks?.filter(t=>t.status==="completed").length||0} done)`,
    `  Events: ${appState.events?.length||0}`,
    `  Hints: ${appState.hints?.length||0} (${appState.hints?.filter(h=>h.status==="active").length||0} active)`,
    `  Points: ${appState.points||0}`,
    `  Compliments delivered: ${appState.compHistory?.length||0}`,
    `  Offers: ${appState.offers?.length||0}`,
    ``,
    resolvedBugs.length > 0 ? `RESOLVED THIS SESSION: ${resolvedBugs.map(b=>b.id).join(", ")}` : "",
    `=== END HANDOFF ===`,
  ].filter(l=>l!==undefined).join("\n");

  const copyHandoff = () => {
    navigator.clipboard?.writeText(handoffText).catch(()=>{});
    showToast("Handoff copied to clipboard 📋");
  };

  const SEV_COLORS = { cosmetic:"var(--blue-tx)", functional:"var(--amber-tx)", blocking:"#e07070" };

  return (
    <div style={{marginTop:"6px"}}>
      {/* Sub-nav */}
      <div className="filters" style={{marginBottom:"14px"}}>
        {[["map","🗺 Component Map"],["bugs","🐛 Bug Log"],["notes","📝 Session Notes"],["handoff","📤 Handoff"]].map(([v,l])=>(
          <button key={v} className={`chip${view===v?" on":""}`} onClick={()=>setView(v)}>{l}
            {v==="bugs"&&bugLog.filter(b=>b.status==="open").length>0&&(
              <span style={{marginLeft:"4px",background:"var(--amber-tx)",color:"var(--bg)",borderRadius:"8px",padding:"0 4px",fontSize:"8px"}}>
                {bugLog.filter(b=>b.status==="open").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Component Map */}
      {view==="map" && (
        <div className="dev-section">
          <div className="dev-section-title">Component Reference Map — tap any ID to copy</div>
          {COMPONENT_MAP.map(screen=>(
            <div key={screen.screen} className="comp-screen">
              <div className="comp-screen-name">{screen.screen}</div>
              {screen.components.map(c=>(
                <div key={c.id} className="comp-item">
                  <span className="comp-item-id">{c.id}</span>
                  <span className="comp-item-lbl">{c.label}</span>
                  <button
                    className={`comp-copy-btn${copiedId===c.id?" copied":""}`}
                    onClick={()=>copyComp(c.id)}
                  >{copiedId===c.id?"✓":"Copy"}</button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Bug Log */}
      {view==="bugs" && (
        <div>
          <div className="dev-section">
            <div className="dev-section-title">New Bug Report</div>
            <div className="bug-form">
              <div>
                <label className="flbl">Component ID</label>
                <input className="finp" placeholder="e.g. hd·CompleteModal·bonus  (or type freely)" value={bugComp} onChange={e=>setBugComp(e.target.value)}/>
                <div style={{fontSize:"11px",color:"var(--muted)",marginTop:"3px",fontFamily:"var(--fm)"}}>Tip: copy from Component Map tab first</div>
              </div>
              <div>
                <label className="flbl">Expected</label>
                <input className="finp" placeholder="What should happen…" value={bugExpect} onChange={e=>setBugExpect(e.target.value)}/>
              </div>
              <div>
                <label className="flbl">What Actually Happened</label>
                <textarea className="ftxt" placeholder="Describe what went wrong…" value={bugActual} onChange={e=>setBugActual(e.target.value)} style={{minHeight:"60px"}}/>
              </div>
              <div>
                <label className="flbl">Severity</label>
                <div className="bug-sev">
                  {["cosmetic","functional","blocking"].map(s=>(
                    <button key={s} className={`bug-sev-btn ${s}${bugSev===s?" on":""}`} onClick={()=>setBugSev(s)}>
                      {s==="cosmetic"?"👁 Cosmetic":s==="functional"?"⚠️ Functional":"🚨 Blocking"}
                    </button>
                  ))}
                </div>
              </div>
              <button className="btn-p" disabled={!bugComp.trim()||!bugActual.trim()} onClick={submitBug} style={{marginTop:"4px"}}>
                Log Bug →
              </button>
            </div>
          </div>

          {bugLog.length===0
            ? <div className="empty"><div className="empty-icon">🐛</div><div className="empty-txt">No bugs logged yet.</div></div>
            : bugLog.map(b=>(
              <div key={b.id} className={`bug-log-item ${b.severity}${b.status==="resolved"?" resolved":""}`}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span className="bug-id">{b.id} · {b.date}</span>
                  <span style={{fontFamily:"var(--fm)",fontSize:"9px",color:SEV_COLORS[b.severity]||"var(--muted)",textTransform:"uppercase"}}>{b.severity}</span>
                </div>
                <div className="bug-comp">[{b.component}]</div>
                {b.expected&&<div style={{fontSize:"12px",color:"var(--muted)",marginTop:"3px",fontFamily:"var(--fm)"}}>Expected: {b.expected}</div>}
                <div className="bug-desc">{b.actual}</div>
                <div className="bug-actions">
                  <button className="bug-act-btn" onClick={()=>toggleBugStatus(b.id)}>
                    {b.status==="open"?"✓ Resolve":"↩ Reopen"}
                  </button>
                  <button className="bug-act-btn" onClick={()=>{ navigator.clipboard?.writeText(`${b.id} [${b.component}]: ${b.actual}`); showToast("Copied bug ref"); }}>
                    📋 Copy Ref
                  </button>
                  <button className="bug-act-btn" style={{color:"rgba(192,57,43,.6)"}} onClick={()=>deleteBug(b.id)}>🗑 Delete</button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* Session Notes */}
      {view==="notes" && (
        <div className="dev-section">
          <div className="dev-section-title">Session Notes — persists across sessions</div>
          <div style={{fontSize:"12px",color:"var(--muted)",marginBottom:"8px",lineHeight:"1.5"}}>
            Use this for things to tell Claude next session, design decisions made, features on hold, or "don't change X" reminders.
          </div>
          <textarea
            className="session-notes-area"
            placeholder={"— Things to tell Claude next session\n— Design decisions made\n— Features on hold\n— Don't change these things…"}
            value={sessionNotes}
            onChange={e=>setSessionNotes(e.target.value)}
          />
          <button className="btn-p" style={{width:"100%",marginTop:"8px"}} onClick={()=>{ showToast("Notes saved ✓"); }}>
            Save Notes
          </button>
        </div>
      )}

      {/* Handoff Export */}
      {view==="handoff" && (
        <div className="dev-section">
          <div className="dev-section-title">Session Handoff — paste this at the start of your next Claude conversation</div>
          <div style={{fontSize:"12px",color:"var(--muted)",marginBottom:"10px",lineHeight:"1.5"}}>
            This bundles your open bugs, session notes, and a data snapshot into one block. Copy it and paste it as your first message to Claude in a new session — instant context, no re-explaining.
          </div>
          <div className="handoff-box">
            <div className="handoff-text">{handoffText}</div>
          </div>
          <button className="btn-p" style={{width:"100%",marginTop:"10px"}} onClick={copyHandoff}>
            📋 Copy Handoff Block
          </button>
          <div style={{fontSize:"12px",color:"var(--muted)",marginTop:"8px",fontStyle:"italic",lineHeight:"1.4"}}>
            After copying, paste it as your very first message in a new Claude session before describing what you want to work on.
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────────────────────────────────────
function ImportModal({ onImport, onClose }) {
  const [parsed,setParsed]=useState(null); const [error,setError]=useState(""); const [mode,setMode]=useState("merge");
  const fileRef=useRef();
  const handleFile=e=>{ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>{try{const p=JSON.parse(ev.target.result); if(!p.data) throw new Error(); setParsed(p); setError("");}catch{setError("Invalid backup file.");} }; r.readAsText(f); };
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="mhandle"/><div className="mtitle">Import Backup</div>
        <div className="fgrp">
          <label className="flbl">Select File</label>
          <input ref={fileRef} type="file" accept=".json" onChange={handleFile} style={{display:"none"}}/>
          <button className="btn-f btn-imp" onClick={()=>fileRef.current.click()}>📂 Choose .hwbackup.json</button>
          {error&&<div style={{fontSize:"12px",color:"var(--red)",marginTop:"5px"}}>{error}</div>}
        </div>
        {parsed&&<div className="prev-box"><div className="prev-title">Preview</div>
          <div className="prev-row"><span>Version</span><strong>v{parsed.appVersion}</strong></div>
          <div className="prev-row"><span>Exported</span><strong>{new Date(parsed.exportedAt).toLocaleString()}</strong></div>
          <div className="prev-row"><span>Tasks</span><strong>{parsed.data.tasks?.length??0}</strong></div>
          <div className="prev-row"><span>Events</span><strong>{parsed.data.events?.length??0}</strong></div>
          <div className="prev-row"><span>Hints</span><strong>{parsed.data.hints?.length??0}</strong></div>
          <div className="prev-row"><span>Points</span><strong>{parsed.data.points??0}</strong></div>
        </div>}
        {parsed&&<div className="fgrp"><label className="flbl">Mode</label>
          <div style={{display:"flex",gap:"8px"}}>
            {["merge","replace"].map(m=><button key={m} className={`dopt${mode===m?" on":""}`} onClick={()=>setMode(m)}>{m==="merge"?"🔀 Merge":"♻️ Replace"}</button>)}
          </div>
          <div style={{fontSize:"12px",color:"var(--muted)",marginTop:"5px"}}>{mode==="merge"?"Adds new items alongside existing data.":"⚠️ Replaces everything. Cannot be undone."}</div>
        </div>}
        <div className="macts"><button className="btn-s" onClick={onClose}>Cancel</button><button className="btn-p" disabled={!parsed} onClick={()=>{onImport(parsed.data,mode);onClose();}}>Import</button></div>
      </div>
    </div>
  );
}

function Settings({ appState, onImport, backupLog, setBackupLog, changeCount, setChangeCount, showToast, devMode, setDevMode, bugLog, setBugLog, sessionNotes, setSessionNotes }) {
  const [showCL,setShowCL]=useState(false); const [showImp,setShowImp]=useState(false);
  const needsBackup = changeCount >= 10;

  const handleExport = () => {
    const payload={appVersion:APP_VERSION,exportedAt:new Date().toISOString(),label:"Happy Wife Backup",data:appState};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob); const a=document.createElement("a");
    a.href=url; a.download=`happywife-backup-${new Date().toISOString().slice(0,10)}.hwbackup.json`; a.click(); URL.revokeObjectURL(url);
    setBackupLog([{date:new Date().toISOString(),version:APP_VERSION,taskCount:appState.tasks.length,eventCount:appState.events.length,hintCount:appState.hints.length},...backupLog].slice(0,10));
    setChangeCount(0);
    showToast("Backup exported! 💾");
  };
  const last=backupLog[0];

  return (
    <div>
      {showImp&&<ImportModal onImport={onImport} onClose={()=>setShowImp(false)}/>}
      <div className="sec-hdr"><div className="sec-title">⚙️ <span>Settings</span></div></div>

      {needsBackup&&(
        <div className="backup-nudge">
          ⚠️ <span>You've made <strong>{changeCount} changes</strong> since your last backup. Export now to stay safe.</span>
        </div>
      )}

      <div style={{marginBottom:"20px"}}>
        <div className="sset-title">📦 Backup & Restore</div>
        <div className="blog">
          <div className="blog-title">Last Backup</div>
          {last?<>
            <div className="blog-row">Date <span>{new Date(last.date).toLocaleString()}</span></div>
            <div className="blog-row">Version <span>v{last.version}</span></div>
            <div className="blog-row">Tasks <span>{last.taskCount}</span></div>
            <div className="blog-row">Events <span>{last.eventCount}</span></div>
            <div className="blog-row">Hints <span>{last.hintCount}</span></div>
            <div className="blog-row">Changes since <span style={{color:needsBackup?"var(--red)":"var(--muted)"}}>{changeCount}</span></div>
          </>:<div style={{fontSize:"13px",color:"var(--muted)",fontStyle:"italic"}}>No backup on record yet.</div>}
        </div>
        <button className="btn-f btn-exp" onClick={handleExport}>💾 Export Backup (.hwbackup.json)</button>
        <button className="btn-f btn-imp" onClick={()=>setShowImp(true)}>📂 Import / Restore Backup</button>
        <div style={{fontSize:"12px",color:"var(--muted)",lineHeight:"1.5",fontStyle:"italic"}}>Save to iCloud, Google Drive, or email to yourself.</div>
      </div>

      <div className="divider"/>
      <div style={{marginBottom:"20px"}}>
        <div className="sset-title">📋 Version History</div>
        <button className="btn-f btn-exp" style={{marginBottom:"11px"}} onClick={()=>setShowCL(!showCL)}>{showCL?"▲ Hide":"▼ Show"} Changelog</button>
        {showCL&&CHANGELOG.map(e=>(
          <div key={e.version} className="cl-entry">
            <div className="cl-ver">v{e.version}</div>
            <div className="cl-date">{e.date}</div>
            {e.changes.map((c,i)=><div key={i} className="cl-item">{c}</div>)}
          </div>
        ))}
      </div>

      <div className="divider"/>

      {/* Dev Mode Toggle */}
      <div className="dev-toggle-row" onClick={()=>setDevMode(!devMode)}>
        <span className={`dev-toggle-lbl${devMode?" on":""}`}>🛠 Dev Mode {devMode?"— ON":""}</span>
        <span className={`dev-pill${devMode?" on":" off"}`}>{devMode?"Enabled":"Off"}</span>
      </div>

      {devMode && (
        <DevToolkit
          bugLog={bugLog} setBugLog={setBugLog}
          sessionNotes={sessionNotes} setSessionNotes={setSessionNotes}
          appState={appState} showToast={showToast}
        />
      )}

      <div className="divider"/>
      <div className="vfooter">Happy Wife · His Edition · v{APP_VERSION}<br/><span>© 2026 · All data stored locally</span></div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,          setTab]         = useState("dashboard");
  const [tasks,        setTasks]       = useStorage("hw4_tasks",      DEFAULT_TASKS);
  const [events,       setEvents]      = useStorage("hw4_events",     DEFAULT_EVENTS);
  const [hints,        setHints]       = useStorage("hw4_hints",      []);
  const [offers,       setOffers]      = useStorage("hw4_offers",     []);
  const [dateHist,     setDateHist]    = useStorage("hw4_datehist",   []);
  const [dateAxes,     setDateAxes]    = useStorage("hw4_dateaxes",   DEFAULT_DATE_AXES);
  const [points,       setPoints]      = useStorage("hw4_points",     130);
  const [backupLog,    setBackupLog]   = useStorage("hw4_backups",    []);
  const [changeCount,  setChangeCount] = useStorage("hw4_changes",    0);
  const [taskHistory,  setTaskHistory] = useStorage("hw4_taskhist",   []);
  const [rewardsHer,   setRewardsHer]  = useStorage("hw4_rwdher",     DEFAULT_REWARDS_HER);
  const [rewardsHim,   setRewardsHim]  = useStorage("hw4_rwdhim",     DEFAULT_REWARDS_HIM);
  const [compHistory,  setCompHistory] = useStorage("hw4_comphist",   []);
  const [customComps,  setCustomComps] = useStorage("hw4_customcomp", []);
  const [herProfile,   setHerProfile]  = useStorage("hw4_herprofile", DEFAULT_HER_PROFILE);
  const [bugLog,       setBugLog]      = useStorage("hw4_buglog",     []);
  const [sessionNotes, setSessionNotes]= useStorage("hw4_sessnotes",  "");
  const [devMode,      setDevMode]     = useStorage("hw4_devmode",    false);

  const [toast,    setToast]   = useState(null);
  const [toastKey, setToastKey]= useState(0);

  const showToast = msg => { setToast(msg); setToastKey(k=>k+1); setTimeout(()=>setToast(null),2400); };
  const onMutate  = () => setChangeCount(c => c + 1);

  const appState = { tasks, events, hints, offers, dateHistory:dateHist, dateAxes, points, rewardsHer, rewardsHim, taskHistory, compHistory, customComps, herProfile, version:APP_VERSION };

  const handleImport = (data, mode) => {
    if (mode === "replace") {
      if (data.tasks        !== undefined) setTasks(data.tasks);
      if (data.events       !== undefined) setEvents(data.events);
      if (data.hints        !== undefined) setHints(data.hints);
      if (data.offers       !== undefined) setOffers(data.offers);
      if (data.dateHistory  !== undefined) setDateHist(data.dateHistory);
      if (data.dateAxes     !== undefined) setDateAxes(data.dateAxes);
      if (data.points       !== undefined) setPoints(data.points);
      if (data.rewardsHer   !== undefined) setRewardsHer(data.rewardsHer);
      if (data.rewardsHim   !== undefined) setRewardsHim(data.rewardsHim);
      if (data.taskHistory  !== undefined) setTaskHistory(data.taskHistory);
      if (data.compHistory  !== undefined) setCompHistory(data.compHistory);
      if (data.customComps  !== undefined) setCustomComps(data.customComps);
      if (data.herProfile   !== undefined) setHerProfile(data.herProfile);
    } else {
      const merge = (existing, incoming, key="id") => {
        const ids = new Set(existing.map(x=>x[key]));
        return [...existing,...(incoming||[]).filter(x=>!ids.has(x[key]))];
      };
      if (data.tasks)      setTasks(merge(tasks,data.tasks));
      if (data.events)     setEvents(merge(events,data.events));
      if (data.hints)      setHints(merge(hints,data.hints));
      if (data.offers)     setOffers(merge(offers,data.offers));
      if (data.rewardsHer) setRewardsHer(merge(rewardsHer,data.rewardsHer));
      if (data.rewardsHim) setRewardsHim(merge(rewardsHim,data.rewardsHim));
      if (data.customComps) setCustomComps(merge(customComps,data.customComps));
      if (data.points !== undefined) setPoints(Math.max(points,data.points));
    }
    setChangeCount(0);
    showToast("Backup imported! ✅");
  };

  // ── DevKit v1.3: injected once on mount, lives outside React root ──────
  useEffect(() => {
    if (document.getElementById('dk-toggle')) return;

    // ── Config ────────────────────────────────────────────────────
    const DK_KEY     = 'hw4_devkit';
    const DKM_KEY    = 'hw4_imap_v1';
    const DK_VERSION = '1.3';
    const APP_VER    = APP_VERSION;
    const APP_PREFIX = 'hw4_';

    // ── Happy Wife Screen Map ─────────────────────────────────────
    const DKM_SCREENS = {
      DASHBOARD:   {icon:'🏠', name:'Dashboard'},
      HONEYDО:     {icon:'🛠️', name:'Honey-Do Hub'},
      REWARDS:     {icon:'🎁', name:'Reward Store'},
      EVENTS:      {icon:'📅', name:'Events'},
      DATES:       {icon:'🍷', name:'Date Planner'},
      GIFTINTEL:   {icon:'💡', name:'Gift Intel'},
      COMPLIMENTS: {icon:'💬', name:'Compliments'},
      OFFERS:      {icon:'📨', name:'Offers'},
      HERWORLD:    {icon:'🌸', name:'Her World'},
      SETTINGS:    {icon:'⚙️', name:'Settings'},
      MODALS:      {icon:'💬', name:'Modals'},
    };

    const DKM_TYPE_ICONS = {
      CARD:'🃏', BUTTON:'🔘', INPUT:'✏️', MODAL:'💬',
      BADGE:'🏷', FILTER:'🔽', TOGGLE:'🔀', SECTION:'📑',
    };

    // ── Interaction Map rows — user edits persisted separately ────
    // Each row: id, form (screen key), object (human name), type, trigger,
    //   stores (yes/no), status (ok/partial/broken/tbd), priority (1/2/3),
    //   current (what it does now), desired (''), notes (''), domHint (CSS selector)
    let DKM_ROWS = [
      // DASHBOARD
      {id:1,  form:'DASHBOARD',   object:'Points Balance Card',          type:'CARD',   trigger:'state', stores:'no', status:'ok',  priority:3, current:'Shows HW Points balance, updates on task completion', desired:'', notes:'', domHint:'.dcard,.pts-badge,.pts-val'},
      {id:2,  form:'DASHBOARD',   object:'Open Tasks Card',              type:'CARD',   trigger:'state', stores:'no', status:'ok',  priority:3, current:'Shows count of pending tasks', desired:'', notes:'', domHint:'.dcard'},
      {id:3,  form:'DASHBOARD',   object:'Upcoming Event Card',          type:'CARD',   trigger:'state', stores:'no', status:'ok',  priority:2, current:'Shows nearest event + days countdown, highlights red if ≤7d', desired:'', notes:'', domHint:'.dcard.urge,.dcard'},
      {id:4,  form:'DASHBOARD',   object:'Gift Hints Card',              type:'CARD',   trigger:'state', stores:'no', status:'ok',  priority:3, current:'Shows active hint count', desired:'', notes:'', domHint:'.dcard'},
      {id:5,  form:'DASHBOARD',   object:'Daily Compliment Nudge',       type:'CARD',   trigger:'state', stores:'no', status:'ok',  priority:2, current:'Shows rotating daily compliment text', desired:'', notes:'', domHint:'.nudge,.nudge-txt'},
      {id:6,  form:'DASHBOARD',   object:'Upcoming Event Alert',         type:'CARD',   trigger:'state', stores:'no', status:'ok',  priority:1, current:'Shows red alert nudge when event ≤14 days away', desired:'', notes:'', domHint:'.nudge.alert'},
      {id:7,  form:'DASHBOARD',   object:'Quick Action — Log Task',      type:'BUTTON', trigger:'tap',   stores:'no', status:'ok',  priority:3, current:'Navigates to Honey-Do tab', desired:'', notes:'', domHint:'.qbtn'},
      {id:8,  form:'DASHBOARD',   object:'Quick Action — Capture Hint',  type:'BUTTON', trigger:'tap',   stores:'no', status:'ok',  priority:3, current:'Navigates to Gift Intel tab', desired:'', notes:'', domHint:'.qbtn'},
      {id:9,  form:'DASHBOARD',   object:'Quick Action — Plan a Date',   type:'BUTTON', trigger:'tap',   stores:'no', status:'ok',  priority:3, current:'Navigates to Dates tab', desired:'', notes:'', domHint:'.qbtn'},
      {id:10, form:'DASHBOARD',   object:'Quick Action — Send Offer',    type:'BUTTON', trigger:'tap',   stores:'no', status:'ok',  priority:3, current:'Navigates to Offers tab', desired:'', notes:'', domHint:'.qbtn'},
      // HONEY-DO
      {id:20, form:'HONEYDО',     object:'Points Banner',                type:'CARD',   trigger:'state', stores:'no', status:'ok',  priority:3, current:'Shows balance + next reward progress bar', desired:'', notes:'', domHint:'.pts-banner,.pts-big'},
      {id:21, form:'HONEYDО',     object:'Category Filter Chips',        type:'FILTER', trigger:'tap',   stores:'no', status:'ok',  priority:3, current:'Filters task list by category', desired:'', notes:'', domHint:'.filters .chip'},
      {id:22, form:'HONEYDО',     object:'Task Card',                    type:'CARD',   trigger:'tap',   stores:'yes',status:'ok',  priority:2, current:'Tap opens CompleteModal for pending, toggles off for completed', desired:'', notes:'', domHint:'.tcard'},
      {id:23, form:'HONEYDО',     object:'Task Card — Recurring Badge',  type:'BADGE',  trigger:'state', stores:'no', status:'ok',  priority:3, current:'Shows recurrence schedule on recurring tasks', desired:'', notes:'', domHint:'.tcard .rec-badge,.tcard-rec'},
      {id:24, form:'HONEYDО',     object:'Task Card — Due Tag',          type:'BADGE',  trigger:'state', stores:'no', status:'ok',  priority:2, current:'Shows due date on recurring tasks, highlights if overdue', desired:'', notes:'', domHint:'.tcard .due-tag'},
      {id:25, form:'HONEYDО',     object:'Add Task Button',              type:'BUTTON', trigger:'tap',   stores:'no', status:'ok',  priority:3, current:'Opens AddTaskModal bottom sheet', desired:'', notes:'', domHint:'.sec-act'},
      {id:26, form:'HONEYDО',     object:'Streak Bar',                   type:'CARD',   trigger:'state', stores:'no', status:'ok',  priority:3, current:'Shows current completion streak with flame icon', desired:'', notes:'', domHint:'.streak-bar,.streak-val'},
      {id:27, form:'HONEYDО',     object:'Task History Panel',           type:'SECTION',trigger:'tap',   stores:'no', status:'ok',  priority:3, current:'Expandable panel showing last 20 completions', desired:'', notes:'', domHint:'.history-panel'},
      {id:28, form:'HONEYDО',     object:'AddTaskModal — Name Input',    type:'MODAL',  trigger:'type',  stores:'no', status:'ok',  priority:3, current:'Task name field in add modal', desired:'', notes:'', domHint:'.modal .finp'},
      {id:29, form:'HONEYDО',     object:'AddTaskModal — Difficulty',    type:'MODAL',  trigger:'tap',   stores:'no', status:'ok',  priority:3, current:'5-level difficulty selector, updates point value', desired:'', notes:'', domHint:'.dopt,.diffs'},
      {id:30, form:'HONEYDО',     object:'AddTaskModal — Recurrence',    type:'MODAL',  trigger:'tap',   stores:'no', status:'ok',  priority:2, current:'None / Weekly / Monthly selector', desired:'', notes:'', domHint:'.modal .rec-sel'},
      {id:31, form:'HONEYDО',     object:'CompleteModal',                type:'MODAL',  trigger:'auto',  stores:'yes',status:'ok',  priority:2, current:'Opens on task tap, shows bonus multipliers before confirming', desired:'', notes:'', domHint:'.overlay .mtitle'},
      {id:32, form:'HONEYDО',     object:'CompleteModal — Bonus Chips',  type:'MODAL',  trigger:'tap',   stores:'yes',status:'ok',  priority:2, current:'Without asked (+25%), Same day (+10%), She noticed (+20%)', desired:'', notes:'', domHint:'.bonus-chip,.bonus-row'},
      // REWARDS
      {id:40, form:'REWARDS',     object:'For Her / For Him Toggle',     type:'TOGGLE', trigger:'tap',   stores:'no', status:'ok',  priority:3, current:'Switches reward list between Her and Him tabs', desired:'', notes:'', domHint:'.rtoggle,.rtbtn'},
      {id:41, form:'REWARDS',     object:'Reward Card',                  type:'CARD',   trigger:'state', stores:'no', status:'ok',  priority:3, current:'Shows reward name, tier, point cost, redeem button', desired:'', notes:'', domHint:'.rcard'},
      {id:42, form:'REWARDS',     object:'Reward Card — Redeem Button',  type:'BUTTON', trigger:'tap',   stores:'yes',status:'ok',  priority:2, current:'Deducts points if balance sufficient, shows toast', desired:'', notes:'', domHint:'.r-red'},
      {id:43, form:'REWARDS',     object:'Custom Reward Card',           type:'CARD',   trigger:'state', stores:'no', status:'ok',  priority:3, current:'User-created reward with edit/delete controls', desired:'', notes:'', domHint:'.custom-rcard'},
      {id:44, form:'REWARDS',     object:'Add Custom Reward Modal',      type:'MODAL',  trigger:'tap',   stores:'yes',status:'ok',  priority:2, current:'Name, cost, icon fields for custom reward creation', desired:'', notes:'', domHint:'.modal .mtitle'},
      // EVENTS
      {id:50, form:'EVENTS',      object:'Event Card',                   type:'CARD',   trigger:'state', stores:'no', status:'ok',  priority:2, current:'Countdown, category badge, alert day chips, notes', desired:'', notes:'', domHint:'.ecard'},
      {id:51, form:'EVENTS',      object:'Event Card — Alert Chips',     type:'BADGE',  trigger:'state', stores:'no', status:'ok',  priority:3, current:'Alert threshold chips highlight when within window', desired:'', notes:'', domHint:'.achip.fired,.achip'},
      {id:52, form:'EVENTS',      object:'Event Card — Tradition',       type:'BADGE',  trigger:'state', stores:'no', status:'ok',  priority:3, current:'Shows anniversary tradition for matched year', desired:'', notes:'', domHint:'.etrad'},
      {id:53, form:'EVENTS',      object:'Anniversary Traditions Panel', type:'SECTION',trigger:'tap',   stores:'no', status:'ok',  priority:3, current:'Expandable panel showing Year 1–60 gift traditions', desired:'', notes:'', domHint:'.card .sub-lbl'},
      {id:54, form:'EVENTS',      object:'Add Event Modal',              type:'MODAL',  trigger:'tap',   stores:'yes',status:'ok',  priority:2, current:'Name, category, month/day/year, notes fields', desired:'', notes:'', domHint:'.overlay .mtitle'},
      // DATES
      {id:60, form:'DATES',       object:'Axis Card (What/Where/How/When)',type:'CARD', trigger:'tap',   stores:'yes',status:'ok',  priority:2, current:'4-axis date picker, each axis has predefined + custom options', desired:'', notes:'', domHint:'.axis-card,.axis-col'},
      {id:61, form:'DATES',       object:'Axis Option Chips',            type:'FILTER', trigger:'tap',   stores:'yes',status:'ok',  priority:3, current:'Select one option per axis, persists custom additions', desired:'', notes:'', domHint:'.axis-opt'},
      {id:62, form:'DATES',       object:'Smart Spin Button',            type:'BUTTON', trigger:'tap',   stores:'no', status:'ok',  priority:2, current:'Combines all 4 axis picks into a date idea result', desired:'', notes:'', domHint:'.spin-btn'},
      {id:63, form:'DATES',       object:'Browse All / Spin Toggle',     type:'TOGGLE', trigger:'tap',   stores:'no', status:'ok',  priority:3, current:'Switches between spin mode and browse list', desired:'', notes:'', domHint:'.sec-act'},
      {id:64, form:'DATES',       object:'Date History Log',             type:'SECTION',trigger:'state', stores:'no', status:'ok',  priority:3, current:'Shows last 5 logged dates with rating emoji', desired:'', notes:'', domHint:'.date-hist,.date-history'},
      // GIFT INTEL
      {id:70, form:'GIFTINTEL',   object:'Hint Card',                    type:'CARD',   trigger:'state', stores:'no', status:'ok',  priority:2, current:'Shows hint name, source, price, linked event, priority dot', desired:'', notes:'', domHint:'.hint-card'},
      {id:71, form:'GIFTINTEL',   object:'Hint Card — Status Cycle',     type:'BUTTON', trigger:'tap',   stores:'yes',status:'ok',  priority:2, current:'Cycles Active → Bought → Given, persists to storage', desired:'', notes:'', domHint:'.hint-status-btn'},
      {id:72, form:'GIFTINTEL',   object:'Hint Card — Link Tag',         type:'BUTTON', trigger:'tap',   stores:'no', status:'ok',  priority:3, current:'Tappable link tag opens URL if present on hint', desired:'', notes:'', domHint:'.ht-link,.hint-card a'},
      {id:73, form:'GIFTINTEL',   object:'Status Filter Chips',          type:'FILTER', trigger:'tap',   stores:'no', status:'ok',  priority:3, current:'Filters by Active / Bought / Given / All', desired:'', notes:'', domHint:'.filters .chip'},
      {id:74, form:'GIFTINTEL',   object:'Gift Seeds Grid',              type:'SECTION',trigger:'tap',   stores:'no', status:'ok',  priority:3, current:'Expandable inspiration grid: 8 categories, 3 ideas each', desired:'', notes:'', domHint:'.seeds-grid,.seed-card'},
      {id:75, form:'GIFTINTEL',   object:'Add Hint Modal',               type:'MODAL',  trigger:'tap',   stores:'yes',status:'ok',  priority:2, current:'Name, source, price, priority, event link, notes, URL', desired:'', notes:'', domHint:'.overlay .mtitle'},
      // COMPLIMENTS
      {id:80, form:'COMPLIMENTS', object:'Daily Compliment Card',        type:'CARD',   trigger:'state', stores:'no', status:'ok',  priority:2, current:'Shows today\'s scheduled compliment with category badge', desired:'', notes:'', domHint:'.cp-daily,.daily-card'},
      {id:81, form:'COMPLIMENTS', object:'Daily Card — Mark Delivered',  type:'BUTTON', trigger:'tap',   stores:'yes',status:'ok',  priority:2, current:'Marks delivered, opens reaction picker', desired:'', notes:'', domHint:'.deliver-btn,.cp-deliver'},
      {id:82, form:'COMPLIMENTS', object:'Daily Card — Refresh',         type:'BUTTON', trigger:'tap',   stores:'no', status:'ok',  priority:3, current:'Gets new compliment, has cooldown to prevent spam', desired:'', notes:'', domHint:'.refresh-btn,.cp-refresh'},
      {id:83, form:'COMPLIMENTS', object:'Reaction Picker',              type:'MODAL',  trigger:'auto',  stores:'yes',status:'ok',  priority:2, current:'1–4 reaction rating after marking delivered', desired:'', notes:'', domHint:'.reaction-picker'},
      {id:84, form:'COMPLIMENTS', object:'Custom Compliment Library',    type:'SECTION',trigger:'state', stores:'no', status:'ok',  priority:3, current:'User-written compliments alongside built-in library', desired:'', notes:'', domHint:'.library-list,.cp-library'},
      {id:85, form:'COMPLIMENTS', object:'Category Stats Bars',          type:'SECTION',trigger:'state', stores:'no', status:'ok',  priority:3, current:'Reaction rating averages per category as bar chart', desired:'', notes:'', domHint:'.stats-bars,.cp-stats'},
      // OFFERS
      {id:90, form:'OFFERS',      object:'Offer Card',                   type:'CARD',   trigger:'state', stores:'no', status:'ok',  priority:2, current:'Shows offer type, title, message, ask, status, point tx', desired:'', notes:'', domHint:'.offer-card'},
      {id:91, form:'OFFERS',      object:'Offer Card — Point Transaction',type:'BADGE', trigger:'state', stores:'no', status:'ok',  priority:2, current:'Shows earn/spend/none tag on offer if point tx attached', desired:'', notes:'', domHint:'.off-pts-tag'},
      {id:92, form:'OFFERS',      object:'Response Token Paste Box',     type:'INPUT',  trigger:'type',  stores:'yes',status:'ok',  priority:1, current:'She pastes response token → status updates + points applied', desired:'', notes:'', domHint:'.paste-box,.off-paste'},
      {id:93, form:'OFFERS',      object:'Create Offer Modal — Type',    type:'MODAL',  trigger:'tap',   stores:'no', status:'ok',  priority:2, current:'4 offer types: Chore, Date, Redeem, Custom', desired:'', notes:'', domHint:'.offer-type-btn'},
      {id:94, form:'OFFERS',      object:'Create Offer Modal — Point Tx',type:'MODAL',  trigger:'tap',   stores:'no', status:'ok',  priority:2, current:'Earn/Spend/None selector, amount input', desired:'', notes:'', domHint:'.off-pts-sel'},
      // HER WORLD
      {id:100,form:'HERWORLD',    object:'Profile & Identity Section',   type:'SECTION',trigger:'tap',   stores:'yes',status:'ok',  priority:2, current:'Name, nickname, love language with descriptions', desired:'', notes:'', domHint:'.hw-profile,.profile-section'},
      {id:101,form:'HERWORLD',    object:'Sizes Section',                type:'SECTION',trigger:'tap',   stores:'yes',status:'ok',  priority:3, current:'Clothing, shoe, ring sizes', desired:'', notes:'', domHint:'.hw-sizes,.sizes-section'},
      {id:102,form:'HERWORLD',    object:'Favorites & Preferences',      type:'SECTION',trigger:'tap',   stores:'yes',status:'ok',  priority:3, current:'Colors, foods, drinks, hobbies, restaurants', desired:'', notes:'', domHint:'.hw-prefs,.prefs-section'},
      {id:103,form:'HERWORLD',    object:'Her People Section',           type:'SECTION',trigger:'tap',   stores:'yes',status:'ok',  priority:3, current:'Key people in her life with notes', desired:'', notes:'', domHint:'.hw-people,.people-section'},
      {id:104,form:'HERWORLD',    object:'Notes Section',                type:'SECTION',trigger:'tap',   stores:'yes',status:'ok',  priority:3, current:'Free-text notes field, auto-saves', desired:'', notes:'', domHint:'.hw-notes,.notes-section'},
      // SETTINGS
      {id:110,form:'SETTINGS',    object:'Backup Nudge Banner',          type:'BADGE',  trigger:'state', stores:'no', status:'ok',  priority:2, current:'Appears when ≥10 changes since last backup', desired:'', notes:'', domHint:'.backup-nudge'},
      {id:111,form:'SETTINGS',    object:'Export Backup Button',         type:'BUTTON', trigger:'tap',   stores:'no', status:'ok',  priority:2, current:'Downloads .hwbackup.json, resets change counter', desired:'', notes:'', domHint:'.btn-exp'},
      {id:112,form:'SETTINGS',    object:'Import / Restore Button',      type:'BUTTON', trigger:'tap',   stores:'yes',status:'ok',  priority:2, current:'Opens ImportModal with merge/replace modes', desired:'', notes:'', domHint:'.btn-imp'},
      {id:113,form:'SETTINGS',    object:'Changelog Toggle',             type:'BUTTON', trigger:'tap',   stores:'no', status:'ok',  priority:3, current:'Expands/collapses in-app changelog', desired:'', notes:'', domHint:'.btn-exp'},
      {id:114,form:'SETTINGS',    object:'Dev Mode Toggle',              type:'TOGGLE', trigger:'tap',   stores:'yes',status:'ok',  priority:3, current:'Shows/hides in-app Dev Toolkit (Layer 1)', desired:'', notes:'', domHint:'.dev-toggle-row,.dev-pill'},
    ];

    // ── DKM Storage (user edits persisted separately from base rows) ──
    const dkmSaveEdits = () => {
      try {
        localStorage.setItem(DKM_KEY, JSON.stringify(
          DKM_ROWS.map(r => ({id:r.id, desired:r.desired, notes:r.notes, status:r.status, priority:r.priority}))
        ));
      } catch(e) {}
    };

    const dkmLoadEdits = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(DKM_KEY)||'null');
        if (!saved) return;
        saved.forEach(s => {
          const r = DKM_ROWS.find(x => x.id === s.id);
          if (!r) return;
          if (s.desired  !== undefined) r.desired  = s.desired;
          if (s.notes    !== undefined) r.notes    = s.notes;
          if (s.status   !== undefined) r.status   = s.status;
          if (s.priority !== undefined) r.priority = s.priority;
        });
      } catch(e) {}
    };

    // ── DKM State ─────────────────────────────────────────────────
    const DKM = {
      step:'screen', screen:null, rowId:null, typeF:'ALL',
      _editStatus:'', _editPriority:1, _newStatus:'tbd', _newSnap:null,
      loaded:false,
    };

    // ── DKM Init ──────────────────────────────────────────────────
    const dkmInit = () => {
      if (!DKM.loaded) { dkmLoadEdits(); DKM.loaded = true; }
      dkmStep('screen');
      dkmRenderScreens();
    };

    // ── DKM Step navigation ───────────────────────────────────────
    const dkmStep = step => {
      DKM.step = step;
      ['screen','object','detail','new'].forEach(s => {
        const el = $('dkm-step-'+s);
        if (el) el.style.display = s===step ? '' : 'none';
      });
      dkmRenderBreadcrumb();
    };

    const dkmRenderBreadcrumb = () => {
      const bc = $('dkm-breadcrumb');
      if (!bc) return;
      const parts = ['<span style="color:#555b6e;cursor:pointer" onclick="dkmGoScreen()">All Screens</span>'];
      if (DKM.screen) {
        const sm = DKM_SCREENS[DKM.screen]||{icon:'',name:DKM.screen};
        parts.push('<span style="color:#555b6e"> › </span>');
        const active = DKM.step==='screen' ? '' : 'cursor:pointer;';
        parts.push(`<span style="color:#00d9d9;${active}" onclick="dkmGoObjects()">${sm.icon} ${sm.name}</span>`);
      }
      if ((DKM.step==='detail'||DKM.step==='new') && DKM.rowId) {
        const row = DKM_ROWS.find(r => r.id===DKM.rowId);
        if (row) {
          parts.push('<span style="color:#555b6e"> › </span>');
          const name = row.object.length>22 ? row.object.slice(0,20)+'…' : row.object;
          parts.push(`<span style="color:#f0f2f7">${esc(name)}</span>`);
        }
      }
      if (DKM.step==='new') {
        parts.push('<span style="color:#555b6e"> › </span>');
        parts.push('<span style="color:#9d4edd">New Entry</span>');
      }
      bc.innerHTML = parts.join('');
    };

    window.dkmGoScreen  = () => dkmStep('screen');
    window.dkmGoObjects = () => { dkmRenderTypeRow(); dkmRenderObjects(); dkmStep('object'); };

    // ── Screen grid ───────────────────────────────────────────────
    const dkmRenderScreens = () => {
      const grid = $('dkm-screen-grid');
      if (!grid) return;
      grid.innerHTML = Object.entries(DKM_SCREENS).map(([key, meta]) => {
        const rows    = DKM_ROWS.filter(r => r.form===key);
        const broken  = rows.filter(r => r.status==='broken').length;
        const partial = rows.filter(r => r.status==='partial').length;
        const tbd     = rows.filter(r => r.status==='tbd').length;
        const badge   = broken  ? `<span style="position:absolute;top:5px;right:5px;background:rgba(232,93,76,0.2);color:#e85d4c;font-size:10px;font-weight:800;padding:1px 5px;border-radius:8px">${broken}</span>`
                      : partial ? `<span style="position:absolute;top:5px;right:5px;background:rgba(255,215,0,0.12);color:#ffd700;font-size:10px;font-weight:800;padding:1px 5px;border-radius:8px">${partial}</span>`
                      : tbd     ? `<span style="position:absolute;top:5px;right:5px;background:rgba(255,255,255,0.06);color:#555b6e;font-size:10px;padding:1px 5px;border-radius:8px">${tbd}</span>` : '';
        const border  = broken ? 'rgba(232,93,76,0.3)' : partial ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.07)';
        return `<div style="background:#191c25;border:1px solid ${border};border-radius:10px;padding:10px;cursor:pointer;position:relative;-webkit-tap-highlight-color:transparent" onclick="dkmSelectScreen('${key}')">
          ${badge}
          <div style="font-size:18px;margin-bottom:5px">${meta.icon}</div>
          <div style="font-size:12px;font-weight:700;color:#f0f2f7;margin-bottom:2px;line-height:1.2">${meta.name}</div>
          <div style="font-size:10px;color:#555b6e">${rows.length} objects</div>
        </div>`;
      }).join('');
    };

    window.dkmSelectScreen = key => {
      DKM.screen = key; DKM.typeF = 'ALL';
      const s = $('dkm-search'); if (s) s.value = '';
      dkmRenderTypeRow(); dkmRenderObjects(); dkmStep('object');
    };

    // ── Object list ───────────────────────────────────────────────
    const dkmRenderTypeRow = () => {
      const row = $('dkm-type-row');
      if (!row) return;
      const types = [...new Set(DKM_ROWS.filter(r => r.form===DKM.screen).map(r => r.type))];
      const chip = (label, val, color) => {
        const sel = DKM.typeF === val;
        const bg  = sel ? `rgba(${color},0.1)` : '#191c25';
        const col = sel ? `rgb(${color})`      : '#555b6e';
        const bdr = sel ? `rgba(${color},0.35)`: 'rgba(255,255,255,0.08)';
        return `<div style="padding:3px 9px;border-radius:14px;font-size:11px;font-weight:600;border:1px solid ${bdr};background:${bg};color:${col};cursor:pointer;white-space:nowrap;flex-shrink:0" onclick="dkmSetType('${val}')">${label}</div>`;
      };
      row.innerHTML = chip('All','ALL','0,217,217') +
        types.map(t => chip((DKM_TYPE_ICONS[t]||'•')+' '+t, t, '157,78,221')).join('');
    };

    window.dkmSetType = t => { DKM.typeF = t; dkmRenderTypeRow(); dkmRenderObjects(); };

    const dkmSortRows = (a,b) => {
      const sv = {broken:0,partial:1,tbd:2,ok:3};
      if (sv[a.status] !== sv[b.status]) return sv[a.status]-sv[b.status];
      return a.priority - b.priority;
    };

    const dkmRenderObjects = () => {
      const list = $('dkm-obj-list');
      if (!list) return;
      const q = (($('dkm-search')||{}).value||'').toLowerCase();
      const rows = DKM_ROWS.filter(r => {
        if (r.form !== DKM.screen) return false;
        if (DKM.typeF !== 'ALL' && r.type !== DKM.typeF) return false;
        if (q && !(r.object+r.current+r.desired+r.notes).toLowerCase().includes(q)) return false;
        return true;
      }).slice().sort(dkmSortRows);

      if (!rows.length) { list.innerHTML='<div style="padding:16px;color:#555b6e;font-size:12px;text-align:center">No objects match</div>'; return; }

      const sc = {ok:'🟢',broken:'🔴',partial:'🟡',tbd:'⚪'};
      const pc = {'1':'#e85d4c','2':'#ffd700','3':'#555b6e'};
      list.innerHTML = rows.map(r => {
        const hasD = r.desired && r.desired.trim();
        return `<div style="margin:0 8px 5px;background:#131620;border-radius:8px;border:1px solid rgba(255,255,255,0.07);border-left:3px solid ${pc[r.priority]||'#555b6e'};padding:9px 10px;cursor:pointer;display:flex;align-items:center;gap:8px" onclick="dkmSelectRow(${r.id})">
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;font-weight:600;color:#f0f2f7;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(r.object)}</div>
            <div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center">
              <span style="font-size:10px">${sc[r.status]||'⚪'}</span>
              <span style="font-size:10px;color:#555b6e">${DKM_TYPE_ICONS[r.type]||'•'} ${r.type}</span>
              ${hasD?'<span style="font-size:9px;font-weight:700;color:#00d9d9">✎</span>':''}
            </div>
          </div>
          <div style="color:#555b6e;font-size:14px">›</div>
        </div>`;
      }).join('') +
      `<div style="margin:8px 8px 0;padding:9px 10px;border-radius:8px;border:1px dashed rgba(255,255,255,0.08);cursor:pointer;text-align:center;color:#555b6e;font-size:12px;font-weight:600" onclick="dkmNewRow(null)">+ Add New Object</div>`;
    };

    // ── Detail view ───────────────────────────────────────────────
    window.dkmSelectRow = id => {
      DKM.rowId = id;
      const row = DKM_ROWS.find(r => r.id===id);
      DKM._editStatus   = row.status;
      DKM._editPriority = row.priority;
      dkmRenderDetail();
      dkmStep('detail');
    };

    const STATUS_LABELS = {ok:'🟢 Working',partial:'🟡 Partial',broken:'🔴 Broken',tbd:'⚪ TBD'};

    const dkmRenderDetail = () => {
      const row = DKM_ROWS.find(r => r.id===DKM.rowId);
      if (!row) return;
      const sm = DKM_SCREENS[row.form]||{icon:'',name:row.form};

      const dc = $('dkm-detail-card');
      if (dc) dc.innerHTML = `
        <div style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">
          <div style="font-size:13px;font-weight:700;color:#f0f2f7;margin-bottom:5px">${esc(row.object)}</div>
          <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">
            <span style="font-size:10px;padding:2px 7px;border-radius:10px;background:rgba(0,217,217,0.08);color:#00d9d9;border:1px solid rgba(0,217,217,0.2)">${sm.icon} ${sm.name}</span>
            <span style="font-size:10px;padding:2px 7px;border-radius:10px;background:rgba(255,255,255,0.05);color:#8b90a0;border:1px solid rgba(255,255,255,0.08)">${row.trigger}</span>
            ${row.stores==='yes'?'<span style="font-size:10px;padding:2px 7px;border-radius:10px;background:rgba(255,215,0,0.07);color:#ffd700;border:1px solid rgba(255,215,0,0.15)">💾 stores</span>':''}
          </div>
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#555b6e;margin-bottom:4px">Current Behavior</div>
          <div style="font-size:12px;color:#8b90a0;line-height:1.5">${esc(row.current)}</div>
          ${row.domHint?`<div style="font-size:10px;color:#555b6e;margin-top:5px;font-family:monospace">${esc(row.domHint)}</div>`:''}
        </div>`;

      const des = $('dkm-desired'), not = $('dkm-notes');
      if (des) des.value = row.desired||'';
      if (not) not.value = row.notes||'';

      const sr = $('dkm-status-row');
      if (sr) sr.innerHTML = ['ok','partial','broken','tbd'].map(s => {
        const sel = s===row.status;
        const col = sel ? (s==='ok'?'#3ddc84':s==='partial'?'#ffd700':s==='broken'?'#e85d4c':'#8b90a0') : '#555b6e';
        const bg  = sel ? (s==='ok'?'rgba(61,220,132,0.12)':s==='partial'?'rgba(255,215,0,0.08)':s==='broken'?'rgba(232,93,76,0.1)':'rgba(255,255,255,0.05)') : '#131620';
        const bdr = sel ? col.replace(')',', 0.4)').replace('rgb','rgba') : 'rgba(255,255,255,0.08)';
        return `<button style="flex:1;padding:7px 4px;border-radius:8px;font-size:11px;font-weight:700;border:1px solid ${bdr};background:${bg};color:${col};cursor:pointer" data-s="${s}" onclick="dkmSetStatus('${s}')">${STATUS_LABELS[s]}</button>`;
      }).join('');

      const pr = $('dkm-pri-row');
      if (pr) pr.innerHTML = [1,2,3].map(p => {
        const sel = p===row.priority;
        const col = p===1?'#e85d4c':p===2?'#ffd700':'#555b6e';
        const bg  = sel?(p===1?'rgba(232,93,76,0.1)':p===2?'rgba(255,215,0,0.08)':'rgba(255,255,255,0.05)'):'#131620';
        const bdr = sel?(p===1?'rgba(232,93,76,0.35)':p===2?'rgba(255,215,0,0.3)':'rgba(255,255,255,0.15)'):'rgba(255,255,255,0.08)';
        const lbl = p===1?'1 — Must fix':p===2?'2 — Should fix':'3 — Nice to have';
        return `<button style="flex:1;padding:7px 4px;border-radius:8px;font-size:11px;font-weight:700;border:1px solid ${bdr};background:${bg};color:${sel?col:'#555b6e'};cursor:pointer" data-p="${p}" onclick="dkmSetPri(${p})">${lbl}</button>`;
      }).join('');

      const peers = DKM_ROWS.filter(r => r.form===DKM.screen).slice().sort(dkmSortRows);
      const idx   = peers.findIndex(r => r.id===DKM.rowId);
      const nav   = $('dkm-detail-nav');
      if (nav) nav.innerHTML =
        (idx>0 ? `<button style="flex:1;padding:8px;border-radius:8px;background:#191c25;border:1px solid rgba(255,255,255,0.08);color:#8b90a0;font-size:12px;font-weight:600;cursor:pointer" onclick="dkmNavDetail(-1)">← Prev</button>` : '') +
        (idx<peers.length-1 ? `<button style="flex:1;padding:8px;border-radius:8px;background:#191c25;border:1px solid rgba(255,255,255,0.08);color:#8b90a0;font-size:12px;font-weight:600;cursor:pointer" onclick="dkmNavDetail(1)">Next →</button>` : '');
    };

    window.dkmSetStatus = s => {
      DKM._editStatus = s;
      const sr = $('dkm-status-row');
      if (!sr) return;
      sr.querySelectorAll('button').forEach(b => {
        const bs = b.getAttribute('data-s');
        const sel = bs===s;
        const col = sel?(bs==='ok'?'#3ddc84':bs==='partial'?'#ffd700':bs==='broken'?'#e85d4c':'#8b90a0'):'#555b6e';
        const bg  = sel?(bs==='ok'?'rgba(61,220,132,0.12)':bs==='partial'?'rgba(255,215,0,0.08)':bs==='broken'?'rgba(232,93,76,0.1)':'rgba(255,255,255,0.05)'):'#131620';
        b.style.background=bg; b.style.color=col;
      });
    };

    window.dkmSetPri = p => {
      DKM._editPriority = p;
      const pr = $('dkm-pri-row');
      if (!pr) return;
      pr.querySelectorAll('button').forEach(b => {
        const bp = parseInt(b.getAttribute('data-p'));
        const sel= bp===p;
        const col= bp===1?'#e85d4c':bp===2?'#ffd700':'#555b6e';
        b.style.color = sel ? col : '#555b6e';
        b.style.background = sel?(bp===1?'rgba(232,93,76,0.1)':bp===2?'rgba(255,215,0,0.08)':'rgba(255,255,255,0.05)'):'#131620';
      });
    };

    window.dkmSaveDetail = (silent) => {
      const row = DKM_ROWS.find(r => r.id===DKM.rowId);
      if (!row) return;
      const des = $('dkm-desired'), not = $('dkm-notes');
      row.desired  = des ? des.value.trim() : row.desired;
      row.notes    = not ? not.value.trim() : row.notes;
      row.status   = DKM._editStatus;
      row.priority = DKM._editPriority;
      dkmSaveEdits();
      if (!silent) { const s=$('dk-sub-toast'); if(s){s.textContent='✓ Saved';setTimeout(()=>{s.textContent='Save Changes';},1500);} }
    };

    window.dkmNavDetail = dir => {
      dkmSaveDetail(true);
      const peers = DKM_ROWS.filter(r => r.form===DKM.screen).slice().sort(dkmSortRows);
      const idx   = peers.findIndex(r => r.id===DKM.rowId);
      const next  = peers[idx+dir];
      if (next) { DKM.rowId=next.id; DKM._editStatus=next.status; DKM._editPriority=next.priority; dkmRenderDetail(); }
    };

    // ── New row form ──────────────────────────────────────────────
    window.dkmNewRow = snap => {
      const ctx = $('dkm-new-ctx'), obj=$('dkm-new-obj'), frm=$('dkm-new-form');
      const cur = $('dkm-new-current'), des=$('dkm-new-desired'), nsr=$('dkm-new-status-row');
      if (snap) {
        if (ctx) ctx.textContent = 'Pre-filled from tapped element — edit as needed.';
        if (obj) obj.value = snap.object||'';
        if (frm) frm.value = snap.form||DKM.screen||'DASHBOARD';
        if (cur) cur.value = snap.current||'';
      } else {
        if (ctx) ctx.textContent = 'Describe a new interaction not yet in the map.';
        if (obj) obj.value = '';
        if (frm) frm.value = DKM.screen||'DASHBOARD';
        if (cur) cur.value = '';
      }
      if (des) des.value = '';
      DKM._newStatus = 'tbd';
      if (nsr) nsr.innerHTML = ['ok','partial','broken','tbd'].map(s => {
        const lbl = STATUS_LABELS[s];
        return `<button style="flex:1;padding:6px 3px;border-radius:8px;font-size:10px;font-weight:700;border:1px solid rgba(255,255,255,0.08);background:#131620;color:#555b6e;cursor:pointer" data-s="${s}" onclick="dkmNewSetStatus('${s}')">${lbl}</button>`;
      }).join('');
      dkmStep('new');
    };

    window.dkmNewSetStatus = s => {
      DKM._newStatus = s;
      const nsr = $('dkm-new-status-row');
      if (!nsr) return;
      nsr.querySelectorAll('button').forEach(b => {
        const bs = b.getAttribute('data-s');
        b.style.background  = bs===s?'rgba(0,217,217,0.1)':'#131620';
        b.style.color       = bs===s?'#00d9d9':'#555b6e';
        b.style.borderColor = bs===s?'rgba(0,217,217,0.35)':'rgba(255,255,255,0.08)';
      });
    };

    window.dkmSaveNew = () => {
      const obj  = ($('dkm-new-obj')||{}).value||'';
      const form = ($('dkm-new-form')||{}).value||'DASHBOARD';
      const cur  = ($('dkm-new-current')||{}).value||'';
      const des  = ($('dkm-new-desired')||{}).value||'';
      if (!obj.trim()) return;
      const newId = Date.now();
      DKM_ROWS.push({
        id:newId, form, object:obj.trim(), type:'BUTTON', trigger:'tap',
        stores:'no', status:DKM._newStatus||'tbd', priority:2,
        current:cur.trim(), desired:des.trim(), notes:'', domHint:'',
      });
      dkmSaveEdits();
      DKM.screen = form;
      dkmSelectScreen(form);
      setTimeout(() => window.dkmSelectRow(newId), 100);
    };

    window.dkmExport = () => {
      const out = JSON.stringify(DKM_ROWS.map(r => ({id:r.id,form:r.form,object:r.object,type:r.type,status:r.status,priority:r.priority,current:r.current,desired:r.desired,notes:r.notes})),null,2);
      if (navigator.share) { navigator.share({title:'Happy Wife Interaction Map',text:out}).catch(()=>{}); return; }
      if (navigator.clipboard) navigator.clipboard.writeText(out);
    };

    // ── Screen key resolver (maps HW nav tab to DKM screen key) ───
    const getScreenKey = () => {
      const a = document.querySelector('.nbtn.active');
      if (!a) return 'DASHBOARD';
      const txt = a.textContent.toLowerCase();
      if (txt.includes('honey') || txt.includes('do')) return 'HONEYDО';
      if (txt.includes('reward'))     return 'REWARDS';
      if (txt.includes('event'))      return 'EVENTS';
      if (txt.includes('date'))       return 'DATES';
      if (txt.includes('gift') || txt.includes('intel')) return 'GIFTINTEL';
      if (txt.includes('compli'))     return 'COMPLIMENTS';
      if (txt.includes('offer'))      return 'OFFERS';
      if (txt.includes('her'))        return 'HERWORLD';
      if (txt.includes('setting'))    return 'SETTINGS';
      return 'DASHBOARD';
    };

    // ── Tag bubble confirm/dismiss ────────────────────────────────
    window.dkmTagConfirm = () => {
      const savedRowId  = dk._tagRowId;
      const savedSnap   = dk._tagSnap;
      const bubble = $('dk-confirm-bubble');
      if (bubble) bubble.style.display='none';
      // Switch to Map tab and navigate to row or new-entry form
      dkmInit();
      window.dkTab('map');
      if (!dk.panelOpen) togglePanel();
      if (savedRowId) {
        const row = DKM_ROWS.find(r => r.id===savedRowId);
        if (row) { DKM.screen=row.form; window.dkmSelectRow(row.id); }
      } else {
        DKM.screen = savedSnap ? (savedSnap.form||'DASHBOARD') : 'DASHBOARD';
        dkmRenderTypeRow(); dkmRenderObjects(); dkmStep('object');
        setTimeout(() => window.dkmNewRow(savedSnap), 150);
      }
    };

    window.dkmTagDismiss = () => {
      const bubble = $('dk-confirm-bubble');
      if (bubble) bubble.style.display='none';
      dk.pendingRef = null;
      dk._tagRowId  = null;
      dk._tagSnap   = null;
    };

    // ── State ─────────────────────────────────────────────────────
    const dk = {
      visible:false, panelOpen:false, activeTab:'log',
      activeCat:'bug', activeSev:'functional', activeEntryFilter:'open',
      pendingRef:null, inspecting:false,
      tapCount:0, tapTimer:null,
      editingId:null,
      navLog:[], liveCodeMap:null, stateTimer:null,
      _tagRowId:null, _tagSnap:null,
    };

    // ── Helpers ───────────────────────────────────────────────────
    const esc   = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const load  = () => { try { return JSON.parse(localStorage.getItem(DK_KEY)||'[]'); } catch(e) { return []; } };
    const save  = log => { try { localStorage.setItem(DK_KEY, JSON.stringify(log)); } catch(e) {} };
    const rel   = ts => { const d=Math.floor((Date.now()-new Date(ts))/1000); if(d<60) return d+'s ago'; if(d<3600) return Math.floor(d/60)+'m ago'; if(d<86400) return Math.floor(d/3600)+'h ago'; return new Date(ts).toLocaleDateString(); };
    const getScreen  = () => { const a=document.querySelector('.nbtn.active'); return a?a.textContent.trim().replace(/[^\w\s·🏠🛠️🎁📅🍷💡💬📨🌸⚙️]/g,'').trim():'—'; };
    const getModal   = () => { const o=document.querySelector('.overlay'); if(!o) return null; const t=o.querySelector('.mtitle'); return t?t.textContent.trim():' modal open'; };
    const readApp    = () => {
      const out = {};
      ['tasks','events','hints','offers','points','taskhist','comphist','datehist'].forEach(k => {
        try { const r=localStorage.getItem(APP_PREFIX+k); if(r!==null) out[k]=JSON.parse(r); } catch(e) {}
      });
      return out;
    };

    // ── Self-regenerating code map ─────────────────────────────────
    const regenCodeMap = () => {
      const fns = [];
      document.querySelectorAll('script').forEach(s => {
        if (!s.textContent) return;
        s.textContent.split('\n').forEach((line, i) => {
          const m = line.match(/^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+([\w$]+)\s*\(([^)]*)/)
                 || line.match(/^\s*(?:export\s+)?const\s+([\w$]+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/);
          if (m) fns.push({name:m[1],params:m[2].trim().slice(0,60),line:i+1});
        });
      });
      const components = fns.filter(f => /^[A-Z]/.test(f.name));
      const helpers    = fns.filter(f => /^[a-z]/.test(f.name));
      dk.liveCodeMap = {generatedAt:new Date().toISOString(),totalFns:fns.length,componentCount:components.length,helperCount:helpers.length,components:components.map(f=>f.name),helpers:helpers.slice(0,40).map(f=>f.name)};
    };

    // ── Nav event log ──────────────────────────────────────────────
    let _lastScreen = '';
    const trackNav = () => {
      const cur = getScreen();
      if (cur !== _lastScreen && cur !== '—') {
        _lastScreen = cur;
        dk.navLog.unshift({screen:cur,ts:new Date().toISOString()});
        if (dk.navLog.length > 8) dk.navLog.pop();
      }
    };
    setInterval(trackNav, 500);

    // ── CSS ───────────────────────────────────────────────────────
    const style = document.createElement('style');
    style.id = 'dk-styles';
    style.textContent = `
      #dk-toggle{position:fixed;bottom:88px;left:12px;z-index:9999;width:40px;height:40px;border-radius:50%;background:#1a1c24;border:1px solid rgba(0,217,217,.35);font-size:18px;display:none;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 12px rgba(0,0,0,.5);transition:transform .15s,box-shadow .15s;user-select:none;-webkit-user-select:none;}
      #dk-toggle:active{transform:scale(.92);}
      #dk-toggle.dk-open{border-color:rgba(0,217,217,.7);box-shadow:0 0 16px rgba(0,217,217,.25);}
      #dk-version{position:fixed;top:8px;right:8px;z-index:9999;padding:2px 7px;border-radius:10px;font-size:9px;letter-spacing:.1em;font-family:'DM Mono',monospace;color:#00d9d9;background:rgba(0,217,217,.1);border:1px solid rgba(0,217,217,.25);display:none;pointer-events:none;}
      #dk-panel{position:fixed;inset:0;z-index:9999;background:#0d0f14;border:none;border-radius:0;display:none;flex-direction:column;height:100%;max-height:100%;font-family:'DM Mono',monospace;}
      #dk-panel.dk-vis{display:flex;}
      #dk-handle{display:none;}
      #dk-hdr{display:flex;align-items:center;gap:6px;padding:8px 12px 6px;flex-shrink:0;border-bottom:1px solid rgba(255,255,255,.06);}
      #dk-hdr-title{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#00d9d9;flex:1;}
      #dk-screen-badge{font-size:9px;padding:2px 7px;border-radius:8px;background:rgba(255,255,255,.06);color:#8b90a0;border:1px solid rgba(255,255,255,.08);max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
      #dk-modal-badge{font-size:9px;padding:2px 7px;border-radius:8px;background:rgba(157,78,221,.15);color:#c084fc;border:1px solid rgba(157,78,221,.3);display:none;}
      .dk-hdr-btn{padding:4px 7px;border-radius:4px;font-size:9px;letter-spacing:.07em;text-transform:uppercase;background:none;border:1px solid rgba(255,255,255,.1);color:#8b90a0;cursor:pointer;}
      #dk-tabs{display:flex;border-bottom:1px solid rgba(255,255,255,.06);flex-shrink:0;}
      .dk-tab{flex:1;padding:7px 4px;font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:#555b6e;background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;}
      .dk-tab.dk-on{color:#00d9d9;border-bottom-color:#00d9d9;}
      #dk-body{flex:1;overflow-y:auto;padding:0;}
      .dk-body-pad{padding:10px 12px 20px;}
      .dk-cats,.dk-sevs,.dk-frow{display:flex;gap:5px;margin-bottom:8px;flex-wrap:wrap;}
      .dk-cat,.dk-sev{padding:4px 9px;border-radius:12px;font-size:9px;letter-spacing:.07em;text-transform:uppercase;border:1px solid rgba(255,255,255,.1);background:none;color:#555b6e;cursor:pointer;}
      .dk-sev{border-radius:5px;flex:1;text-align:center;}
      .dk-on-bug{background:rgba(232,93,76,.15);border-color:rgba(232,93,76,.4)!important;color:#e85d4c!important;}
      .dk-on-ui{background:rgba(0,217,217,.1);border-color:rgba(0,217,217,.3)!important;color:#00d9d9!important;}
      .dk-on-feat{background:rgba(157,78,221,.15);border-color:rgba(157,78,221,.4)!important;color:#9d4edd!important;}
      .dk-on-note{background:rgba(255,215,0,.1);border-color:rgba(255,215,0,.3)!important;color:#ffd700!important;}
      .dk-on-open{background:rgba(232,93,76,.12);border-color:rgba(232,93,76,.35)!important;color:#e85d4c!important;}
      .dk-on-resolved{background:rgba(74,124,89,.12);border-color:rgba(74,124,89,.35)!important;color:#7ab88a!important;}
      .dk-on-all{background:rgba(0,217,217,.08);border-color:rgba(0,217,217,.25)!important;color:#00d9d9!important;}
      .dk-on-cosmetic{background:rgba(0,217,217,.1);border-color:rgba(0,217,217,.3)!important;color:#00d9d9!important;}
      .dk-on-functional{background:rgba(255,215,0,.1);border-color:rgba(255,215,0,.25)!important;color:#ffd700!important;}
      .dk-on-blocking{background:rgba(232,93,76,.15);border-color:rgba(232,93,76,.4)!important;color:#e85d4c!important;}
      .dk-inp{width:100%;background:#1f2330;border:1px solid rgba(255,255,255,.1);border-radius:5px;padding:6px 9px;color:#f0f2f7;font-family:'DM Mono',monospace;font-size:11px;outline:none;margin-bottom:6px;box-sizing:border-box;}
      .dk-inp:focus{border-color:rgba(0,217,217,.4);}
      .dk-ta{width:100%;background:#1f2330;border:1px solid rgba(255,255,255,.1);border-radius:5px;padding:7px 9px;color:#f0f2f7;font-family:'DM Mono',monospace;font-size:12px;outline:none;resize:none;min-height:64px;margin-bottom:8px;line-height:1.5;box-sizing:border-box;}
      .dk-ta:focus{border-color:rgba(0,217,217,.4);}
      .dk-ref-chip{padding:5px 9px;background:#1f2330;border:1px solid rgba(0,217,217,.3);border-radius:5px;font-size:10px;color:#00d9d9;margin-bottom:6px;display:flex;align-items:center;justify-content:space-between;}
      .dk-ref-chip.dk-gone{display:none!important;}
      .dk-ref-x{background:none;border:none;color:#555b6e;cursor:pointer;font-size:13px;padding:0 0 0 8px;}
      .dk-sub{width:100%;padding:9px;background:rgba(0,217,217,.12);border:1px solid rgba(0,217,217,.35);border-radius:5px;color:#00d9d9;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.09em;text-transform:uppercase;cursor:pointer;}
      .dk-entry{padding:8px 10px;background:#191c25;border-radius:6px;margin-bottom:7px;border-left:3px solid #2a2d3a;}
      .dk-entry.dk-resolved{opacity:.5;}
      .dk-e-bug{border-left-color:#e85d4c!important;} .dk-e-ui{border-left-color:#00d9d9!important;} .dk-e-feat{border-left-color:#9d4edd!important;} .dk-e-note{border-left-color:#ffd700!important;}
      .dk-etop{display:flex;align-items:center;gap:5px;margin-bottom:4px;}
      .dk-bdg{padding:1px 6px;border-radius:8px;font-size:8px;letter-spacing:.07em;text-transform:uppercase;}
      .dk-b-bug{background:rgba(232,93,76,.2);color:#e85d4c;border:1px solid rgba(232,93,76,.3);}
      .dk-b-ui{background:rgba(0,217,217,.12);color:#00d9d9;border:1px solid rgba(0,217,217,.25);}
      .dk-b-feat{background:rgba(157,78,221,.15);color:#9d4edd;border:1px solid rgba(157,78,221,.3);}
      .dk-b-note{background:rgba(255,215,0,.1);color:#ffd700;border:1px solid rgba(255,215,0,.25);}
      .dk-b-cos{background:rgba(0,217,217,.08);color:#00d9d9;border:1px solid rgba(0,217,217,.2);}
      .dk-b-fun{background:rgba(255,215,0,.08);color:#ffd700;border:1px solid rgba(255,215,0,.2);}
      .dk-b-blk{background:rgba(232,93,76,.1);color:#e85d4c;border:1px solid rgba(232,93,76,.2);}
      .dk-b-res{background:rgba(74,124,89,.1);color:#7ab88a;border:1px solid rgba(74,124,89,.2);}
      .dk-escr{font-size:9px;color:#555b6e;margin-left:auto;white-space:nowrap;}
      .dk-emsg{font-size:12px;color:#c8ccd8;line-height:1.5;margin-bottom:3px;}
      .dk-emsg.dk-editing{display:none;}
      .dk-edit-ta{width:100%;background:#252938;border:1px solid rgba(0,217,217,.4);border-radius:4px;padding:5px 8px;color:#f0f2f7;font-family:'DM Mono',monospace;font-size:11px;outline:none;resize:none;min-height:48px;margin-bottom:5px;box-sizing:border-box;display:none;}
      .dk-edit-ta.dk-editing{display:block;}
      .dk-eref{font-size:10px;color:#00d9d9;} .dk-emod{font-size:10px;color:#c084fc;} .dk-ecomp{font-size:10px;color:#8b90a0;}
      .dk-ebot{display:flex;align-items:center;justify-content:space-between;margin-top:5px;gap:4px;}
      .dk-ets{font-size:9px;color:#555b6e;flex:1;}
      .dk-act{background:none;border:none;color:#555b6e;cursor:pointer;font-size:11px;padding:2px 4px;border-radius:3px;}
      .dk-act:hover{color:#8b90a0;}
      .dk-act.dk-res{color:#7ab88a!important;}
      #dk-state{font-size:11px;color:#8b90a0;line-height:1.8;white-space:pre-wrap;background:#191c25;padding:10px 12px;border-radius:6px;border:1px solid rgba(255,255,255,.06);}
      #dk-claude-out{font-size:10px;color:#a8967e;line-height:1.7;white-space:pre-wrap;word-break:break-word;background:#1a1410;padding:10px 12px;border-radius:6px;border:1px solid rgba(201,168,76,.15);margin-bottom:8px;max-height:280px;overflow-y:auto;}
      .dk-cpbtn{width:100%;padding:9px;background:rgba(201,168,76,.12);border:1px solid rgba(201,168,76,.35);border-radius:5px;color:#c9a84c;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.09em;text-transform:uppercase;cursor:pointer;margin-bottom:6px;}
      .dk-cpbtn.dk-copied{background:rgba(74,124,89,.15);border-color:rgba(74,124,89,.4);color:#7ab88a;}
      #dk-inspect-overlay{position:fixed;inset:0;z-index:9998;background:rgba(0,217,217,.06);pointer-events:none;display:none;}
      #dk-inspect-banner{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10000;background:#0d0f14;border:1px solid rgba(0,217,217,.5);border-radius:8px;padding:12px 20px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#00d9d9;pointer-events:none;display:none;font-family:'DM Mono',monospace;}
      #dk-confirm-bubble{position:fixed;z-index:10001;background:#131620;border:1.5px solid rgba(0,217,217,.5);border-radius:12px;padding:12px 14px;min-width:220px;max-width:290px;box-shadow:0 8px 32px rgba(0,0,0,.7);display:none;font-family:'DM Mono',monospace;}
      #dk-confirm-bubble .dk-cb-title{font-size:10px;font-weight:700;color:#00d9d9;margin-bottom:4px;text-transform:uppercase;letter-spacing:.04em;}
      #dk-confirm-bubble .dk-cb-el{font-size:13px;font-weight:600;color:#f0f2f7;margin-bottom:3px;line-height:1.3;}
      #dk-confirm-bubble .dk-cb-ctx{font-size:11px;color:#555b6e;margin-bottom:10px;line-height:1.4;}
      #dk-confirm-bubble .dk-cb-btns{display:flex;gap:6px;}
      #dk-confirm-bubble .dk-cb-btn{flex:1;padding:8px 6px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:1px solid;}
      .dk-cb-map{background:rgba(0,217,217,.12);border-color:rgba(0,217,217,.35)!important;color:#00d9d9;}
      .dk-cb-log{background:#191c25;border-color:rgba(255,255,255,.1)!important;color:#8b90a0;}
      .dk-flash{outline:2px solid #00d9d9!important;outline-offset:2px!important;}
      .dk-empty{text-align:center;padding:28px 16px;color:#555b6e;font-size:12px;}
      #dkm-breadcrumb{padding:8px 12px;border-bottom:1px solid rgba(255,255,255,.06);font-size:11px;display:flex;align-items:center;gap:3px;background:#0d0f14;flex-shrink:0;}
      #dkm-screen-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:8px 10px;}
      #dkm-type-row{display:flex;gap:5px;padding:6px 10px 4px;overflow-x:auto;scrollbar-width:none;flex-shrink:0;}
      #dkm-type-row::-webkit-scrollbar{display:none;}
      #dkm-search{width:100%;background:#1f2330;border:1px solid rgba(255,255,255,.1);color:#f0f2f7;font-size:12px;padding:7px 10px;border-radius:8px;outline:none;font-family:'DM Mono',monospace;box-sizing:border-box;}
      #dkm-search:focus{border-color:rgba(0,217,217,.4);}
      .dkm-ta{width:100%;background:#1f2330;border:1px solid rgba(255,255,255,.1);color:#f0f2f7;font-size:13px;padding:8px;border-radius:7px;font-family:'DM Mono',monospace;resize:none;line-height:1.5;outline:none;box-sizing:border-box;}
      .dkm-ta:focus{border-color:rgba(0,217,217,.4);}
      .dkm-lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#555b6e;margin-bottom:5px;margin-top:8px;}
      #dk-sub-toast{width:100%;margin-top:8px;padding:11px;border-radius:10px;background:#00d9d9;color:#000;font-size:13px;font-weight:700;border:none;cursor:pointer;}
    `;
    document.head.appendChild(style);

    // ── DOM ───────────────────────────────────────────────────────
    const $ = id => document.getElementById(id);

    const mkEl = (tag, id, html='') => {
      const el = document.createElement(tag);
      el.id = id; if (html) el.innerHTML = html;
      document.body.appendChild(el); return el;
    };

    mkEl('div','dk-toggle','🐛');
    mkEl('div','dk-version','DEV v'+DK_VERSION);
    mkEl('div','dk-inspect-overlay');
    mkEl('div','dk-inspect-banner','TAP ANY ELEMENT TO TAG IT');
    mkEl('div','dk-confirm-bubble');

    const panel = mkEl('div','dk-panel');
    panel.innerHTML = `
      <div id="dk-handle"></div>
      <div id="dk-hdr">
        <span id="dk-hdr-title">DevKit v${DK_VERSION}</span>
        <span id="dk-screen-badge">—</span>
        <span id="dk-modal-badge">📱 modal</span>
        <button class="dk-hdr-btn" onclick="dkInspect()">🔍 Inspect</button>
        <button class="dk-hdr-btn" onclick="dkExport()">⬆ Export</button>
        <button class="dk-hdr-btn" onclick="dkmExport()">🗺 Map</button>
        <button class="dk-hdr-btn" onclick="dkClose()" style="margin-left:auto;border-color:rgba(255,255,255,.18);color:#8b90a0;font-size:14px;padding:2px 8px;" title="Close DevKit">✕</button>
      </div>
      <div id="dk-tabs">
        <button class="dk-tab dk-on" onclick="dkTab('log')">Log</button>
        <button class="dk-tab" onclick="dkTab('entries')">Entries</button>
        <button class="dk-tab" onclick="dkTab('map')">🗺 Map</button>
        <button class="dk-tab" onclick="dkTab('state')">State</button>
        <button class="dk-tab" onclick="dkTab('claude')">→ Claude</button>
      </div>
      <div id="dk-body"></div>
    `;

    // ── Render: Log tab ───────────────────────────────────────────
    const renderLog = () => {
      const CATS = {bug:'🐛 Bug',ui:'🎨 UI',feat:'✨ Feature',note:'📝 Note'};
      const SEVS = {cosmetic:'👁 Cosmetic',functional:'⚠ Functional',blocking:'🚨 Blocking'};
      const catBtns = Object.entries(CATS).map(([c,l]) =>
        `<button class="dk-cat${dk.activeCat===c?' dk-on-'+c:''}" onclick="dkCat('${c}')">${l}</button>`).join('');
      const sevBtns = Object.entries(SEVS).map(([s,l]) =>
        `<button class="dk-sev${dk.activeSev===s?' dk-on-'+s:''}" onclick="dkSev('${s}')">${l}</button>`).join('');
      const refHidden = dk.pendingRef ? '' : ' dk-gone';
      $('dk-body').innerHTML = `<div class="dk-body-pad">
        <div class="dk-cats">${catBtns}</div>
        <div class="dk-sevs">${sevBtns}</div>
        <div class="dk-ref-chip${refHidden}" id="dk-rchip">
          <span>🔍 ${esc(dk.pendingRef||'')}</span>
          <button class="dk-ref-x" onclick="dkClearRef()">✕</button>
        </div>
        <textarea class="dk-ta" id="dk-msg" placeholder="Describe the issue, feature, or note…"></textarea>
        <button class="dk-sub" id="dk-sub" onclick="dkSubmit()">Add Entry →</button>
      </div>`;
    };

    // ── Render: Entries tab ───────────────────────────────────────
    const renderEntries = () => {
      const log  = load();
      const filt = dk.activeEntryFilter;
      const shown = filt==='all'?log:log.filter(e=>filt==='resolved'?!!e.resolved:!e.resolved);
      const openCnt=log.filter(e=>!e.resolved).length, resCnt=log.filter(e=>!!e.resolved).length;
      const sevClass={cosmetic:'dk-b-cos',functional:'dk-b-fun',blocking:'dk-b-blk'};
      const filterBtns = [
        `<button class="dk-cat${filt==='open'?' dk-on-open':''}" onclick="dkEntFilt('open')">Open (${openCnt})</button>`,
        `<button class="dk-cat${filt==='resolved'?' dk-on-resolved':''}" onclick="dkEntFilt('resolved')">Resolved (${resCnt})</button>`,
        `<button class="dk-cat${filt==='all'?' dk-on-all':''}" onclick="dkEntFilt('all')">All (${log.length})</button>`,
      ].join('');
      const items = shown.length===0 ? '<div class="dk-empty">Nothing here.</div>' : shown.map(e => {
        const sev=e.sev?`<span class="dk-bdg ${sevClass[e.sev]||''}">${e.sev}</span>`:'';
        const resBdg=e.resolved?`<span class="dk-bdg dk-b-res">resolved</span>`:'';
        const comp=e.comp?`<div class="dk-ecomp">📍 ${esc(e.comp)}</div>`:'';
        const ref=e.ref?`<div class="dk-eref">🔍 ${esc(e.ref)}</div>`:'';
        const mod=e.modal?`<div class="dk-emod">📱 ${esc(e.modal)}</div>`:'';
        const isEdit=dk.editingId===e.id;
        return `<div class="dk-entry dk-e-${e.cat}${e.resolved?' dk-resolved':''}">
          <div class="dk-etop"><span class="dk-bdg dk-b-${e.cat}">${e.cat}</span>${sev}${resBdg}<span class="dk-escr">${esc(e.screen||'')}</span></div>
          <div class="dk-emsg${isEdit?' dk-editing':''}">${esc(e.msg)}</div>
          <textarea class="dk-edit-ta${isEdit?' dk-editing':''}" id="dk-eta-${e.id}" onblur="dkSaveEdit(${e.id})">${esc(e.msg)}</textarea>
          ${comp}${ref}${mod}
          <div class="dk-ebot">
            <span class="dk-ets">${rel(e.ts)}</span>
            <button class="dk-act" title="Edit" onclick="dkStartEdit(${e.id})">✏️</button>
            <button class="dk-act${e.resolved?' dk-res':''}" title="${e.resolved?'Reopen':'Resolve'}" onclick="dkToggleResolve(${e.id})">${e.resolved?'↩':'✓'}</button>
            <button class="dk-act" title="Delete" onclick="dkDel(${e.id})" style="color:rgba(232,93,76,.5)">✕</button>
          </div>
        </div>`;
      }).join('');
      $('dk-body').innerHTML = `<div class="dk-body-pad"><div class="dk-frow">${filterBtns}</div>${items}</div>`;
    };

    // ── Render: Map tab ───────────────────────────────────────────
    const renderMap = () => {
      dkmInit();
      $('dk-body').innerHTML = `
        <div id="dkm-breadcrumb"></div>
        <div style="flex:1;overflow-y:auto" id="dkm-scroll">
          <div id="dkm-step-screen">
            <div style="padding:6px 12px 4px;font-size:11px;color:#555b6e">Select a screen to view its interactions:</div>
            <div id="dkm-screen-grid"></div>
          </div>
          <div id="dkm-step-object" style="display:none">
            <div style="padding:6px 10px 0"><input id="dkm-search" placeholder="🔍 Filter objects…" oninput="dkmRenderObjects()"></div>
            <div id="dkm-type-row"></div>
            <div id="dkm-obj-list" style="padding:4px 0 8px"></div>
          </div>
          <div id="dkm-step-detail" style="display:none;padding:8px 10px 12px">
            <div id="dkm-detail-card" style="background:#191c25;border:1px solid rgba(255,255,255,.07);border-radius:10px;margin-bottom:10px;overflow:hidden"></div>
            <div style="background:#191c25;border:1px solid rgba(255,255,255,.07);border-radius:10px;overflow:hidden">
              <div style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.06)">
                <div class="dkm-lbl" style="margin-top:0">Desired Outcome</div>
                <textarea id="dkm-desired" class="dkm-ta" rows="4" placeholder="What should happen? Describe exact UI behavior…"></textarea>
                <div class="dkm-lbl">Notes / Edge Cases</div>
                <textarea id="dkm-notes" class="dkm-ta" rows="2" placeholder="Edge cases, related IDs, implementation context…"></textarea>
              </div>
              <div style="padding:8px 12px;border-bottom:1px solid rgba(255,255,255,.06)">
                <div class="dkm-lbl" style="margin-top:0">Status</div>
                <div style="display:flex;gap:5px" id="dkm-status-row"></div>
              </div>
              <div style="padding:8px 12px">
                <div class="dkm-lbl" style="margin-top:0">Priority</div>
                <div style="display:flex;gap:5px" id="dkm-pri-row"></div>
              </div>
            </div>
            <div style="display:flex;gap:6px;margin-top:8px" id="dkm-detail-nav"></div>
            <button id="dk-sub-toast" onclick="dkmSaveDetail()">Save Changes</button>
          </div>
          <div id="dkm-step-new" style="display:none;padding:8px 10px 12px">
            <div style="font-size:12px;color:#8b90a0;margin-bottom:10px;line-height:1.5" id="dkm-new-ctx"></div>
            <div style="background:#191c25;border:1px solid rgba(255,255,255,.07);border-radius:10px;overflow:hidden">
              <div style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.06)">
                <div class="dkm-lbl" style="margin-top:0">Object Name</div>
                <input id="dkm-new-obj" class="dk-inp" style="margin-bottom:0" placeholder="e.g. Task Card — Complete Button">
                <div class="dkm-lbl">Screen</div>
                <select id="dkm-new-form" class="dk-inp" style="margin-bottom:0">
                  ${Object.entries(DKM_SCREENS).map(([k,v])=>`<option value="${k}">${v.icon} ${v.name}</option>`).join('')}
                </select>
                <div class="dkm-lbl">Current Behavior</div>
                <textarea id="dkm-new-current" class="dkm-ta" rows="2" placeholder="What does it do now?"></textarea>
                <div class="dkm-lbl">Desired Outcome</div>
                <textarea id="dkm-new-desired" class="dkm-ta" rows="3" placeholder="What should happen instead?"></textarea>
              </div>
              <div style="padding:8px 12px;display:flex;gap:5px" id="dkm-new-status-row"></div>
            </div>
            <button style="width:100%;margin-top:8px;padding:11px;border-radius:10px;background:#00d9d9;color:#000;font-size:13px;font-weight:700;border:none;cursor:pointer" onclick="dkmSaveNew()">Add to Map</button>
          </div>
        </div>`;
      dkmRenderScreens();
    };

    // ── Render: State tab ─────────────────────────────────────────
    const renderState = () => {
      $('dk-body').innerHTML = '<div class="dk-body-pad"><pre id="dk-state">Loading…</pre></div>';
      updateState();
    };
    const updateState = () => {
      const el = $('dk-state'); if (!el) return;
      const s=readApp(), tasks=s.tasks||[], hints=s.hints||[], offers=s.offers||[];
      const brokenRows = DKM_ROWS.filter(r=>r.status==='broken').length;
      const partialRows= DKM_ROWS.filter(r=>r.status==='partial').length;
      el.textContent = [
        `── HAPPY WIFE  ·  v${APP_VER} ──`,``,
        `SCREEN:      ${getScreen()}`,`MODAL:       ${getModal()||'none'}`,``,
        `── POINTS ──`,`Balance:     ${s.points||0} pts`,``,
        `── TASKS ──`,`Total:       ${tasks.length}`,
        `Pending:     ${tasks.filter(t=>t.status==='pending').length}`,
        `Completed:   ${tasks.filter(t=>t.status==='completed').length}`,
        `Recurring:   ${tasks.filter(t=>t.recurring).length}`,``,
        `── GIFT INTEL ──`,
        `Active:      ${hints.filter(h=>h.status==='active').length}`,
        `Bought:      ${hints.filter(h=>h.status==='bought').length}`,``,
        `── OFFERS ──`,`Total:       ${offers.length}`,
        `Pending:     ${offers.filter(o=>o.status==='pending').length}`,``,
        `── MAP STATUS ──`,
        `Total rows:  ${DKM_ROWS.length}`,
        `Broken:      ${brokenRows}`,`Partial:     ${partialRows}`,
        `TBD:         ${DKM_ROWS.filter(r=>r.status==='tbd').length}`,``,
        `── NAV LOG ──`,
        ...dk.navLog.map(n=>`  ${n.screen.slice(0,18).padEnd(18)} ${rel(n.ts)}`),``,
        `── DEVKIT ──`,
        `Log:         ${load().length} entries (${load().filter(e=>!e.resolved).length} open)`,
        `Code map:    ${dk.liveCodeMap?dk.liveCodeMap.totalFns+' fns':'—'}`,
        `Refreshed:   ${new Date().toLocaleTimeString()}`,
      ].join('\n');
    };

    // ── Render: Claude tab ────────────────────────────────────────
    const buildClaudeBlock = () => {
      const log=load(), s=readApp();
      const bugs=log.filter(e=>e.cat==='bug'&&!e.resolved);
      const ui=log.filter(e=>e.cat==='ui'&&!e.resolved);
      const feats=log.filter(e=>e.cat==='feat'&&!e.resolved);
      const notes=log.filter(e=>e.cat==='note');
      const tasks=s.tasks||[], hints=s.hints||[], offers=s.offers||[];
      const brokenMap=DKM_ROWS.filter(r=>r.status==='broken'&&r.desired);
      const cm=dk.liveCodeMap;
      const lines=[`=== HAPPY WIFE DEV HANDOFF ===`,`App: Happy Wife v${APP_VER}`,`Date: ${new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}`,``];
      if(bugs.length){lines.push(`── BUGS (${bugs.length}) ──`);bugs.forEach((e,i)=>{lines.push(`${i+1}. [${(e.sev||'?').toUpperCase()}] ${e.comp?'['+e.comp+'] ':''}${e.msg}`);if(e.ref)lines.push(`   Element: ${e.ref}`);if(e.modal)lines.push(`   Context: ${e.modal}`);lines.push(`   Screen: ${e.screen||'?'} · ${rel(e.ts)}`);});lines.push('');}
      if(ui.length){lines.push(`── UI ISSUES (${ui.length}) ──`);ui.forEach((e,i)=>{lines.push(`${i+1}. ${e.comp?'['+e.comp+'] ':''}${e.msg}`);if(e.ref)lines.push(`   Element: ${e.ref}`);lines.push(`   Screen: ${e.screen||'?'}`);});lines.push('');}
      if(feats.length){lines.push(`── FEATURE REQUESTS (${feats.length}) ──`);feats.forEach((e,i)=>lines.push(`${i+1}. ${e.msg}`));lines.push('');}
      if(notes.length){lines.push(`── NOTES (${notes.length}) ──`);notes.forEach((e,i)=>lines.push(`${i+1}. ${e.msg}`));lines.push('');}
      if(brokenMap.length){lines.push(`── MAP — BROKEN + DESIRED (${brokenMap.length}) ──`);brokenMap.forEach((r,i)=>lines.push(`${i+1}. [${r.form}] ${r.object}: ${r.desired}`));lines.push('');}
      lines.push(`── APP SNAPSHOT ──`);
      lines.push(`Points: ${s.points||0}  Tasks: ${tasks.length} (${tasks.filter(t=>t.status==='pending').length} pending)  Hints: ${hints.filter(h=>h.status==='active').length} active  Offers: ${offers.length}`);
      if(cm){lines.push('');lines.push(`── CODE MAP ──`);lines.push(`${cm.totalFns} fns · ${cm.componentCount} components · ${cm.helperCount} helpers`);lines.push(`Components: ${cm.components.join(', ')}`);}
      lines.push('');lines.push(`=== END HANDOFF ===`);
      return lines.join('\n');
    };
    const renderClaude = () => {
      const txt=buildClaudeBlock();
      $('dk-body').innerHTML=`<div class="dk-body-pad">
        <div style="font-size:10px;color:#5a4d3a;margin-bottom:8px;line-height:1.5">Paste this as your <strong style="color:#a8967e">first message</strong> in a new Claude session.</div>
        <pre id="dk-claude-out">${esc(txt)}</pre>
        <button class="dk-cpbtn" id="dk-cc" onclick="dkCopyC()">📋 Copy Handoff Block</button>
        <button class="dk-cpbtn" style="background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.1);color:#555b6e" onclick="dkTab('claude')">↺ Refresh</button>
      </div>`;
    };

    // ── Global functions ──────────────────────────────────────────
    window.dkTab = name => {
      dk.activeTab=name;
      if(name!=='state'&&dk.stateTimer){clearInterval(dk.stateTimer);dk.stateTimer=null;}
      document.querySelectorAll('.dk-tab').forEach((t,i)=>t.classList.toggle('dk-on',['log','entries','map','state','claude'][i]===name));
      if(name==='log')     renderLog();
      if(name==='entries') renderEntries();
      if(name==='map')     renderMap();
      if(name==='state')   { renderState(); if(!dk.stateTimer) dk.stateTimer=setInterval(()=>{if(dk.panelOpen&&dk.activeTab==='state') updateState();},2000); }
      if(name==='claude')  renderClaude();
    };
    window.dkCat   = c => { dk.activeCat=c; renderLog(); };
    window.dkSev   = s => { const msg=($('dk-msg')||{}).value||''; dk.activeSev=s; renderLog(); setTimeout(()=>{if($('dk-msg'))$('dk-msg').value=msg;},0); };
    window.dkEntFilt = f => { dk.activeEntryFilter=f; renderEntries(); };
    window.dkDel     = id => { save(load().filter(e=>e.id!==id)); renderEntries(); };
    window.dkClearRef = () => { dk.pendingRef=null; const c=$('dk-rchip'); if(c)c.classList.add('dk-gone'); };
    window.dkToggleResolve = id => { const log=load(); save(log.map(e=>e.id===id?{...e,resolved:!e.resolved,resolvedAt:!e.resolved?new Date().toISOString():null}:e)); renderEntries(); };
    window.dkStartEdit = id => { dk.editingId=id; renderEntries(); setTimeout(()=>{const ta=$('dk-eta-'+id);if(ta){ta.focus();ta.setSelectionRange(ta.value.length,ta.value.length);}},50); };
    window.dkSaveEdit  = id => { const ta=$('dk-eta-'+id); if(!ta)return; const msg=ta.value.trim(); if(msg){const log=load();save(log.map(e=>e.id===id?{...e,msg,editedAt:new Date().toISOString()}:e));} dk.editingId=null; renderEntries(); };
    window.dkSubmit = () => {
      const msg=($('dk-msg')||{}).value||''; if(!msg.trim())return;
      const entry={id:Date.now(),ts:new Date().toISOString(),cat:dk.activeCat,sev:dk.activeSev,msg:msg.trim(),screen:getScreen(),modal:getModal(),ref:dk.pendingRef,resolved:false};
      const log=load();log.unshift(entry);save(log);dk.pendingRef=null;
      renderLog();
      const sub=$('dk-sub');if(sub){sub.textContent='✓ Saved';setTimeout(()=>{if($('dk-sub'))$('dk-sub').textContent='Add Entry →';},1200);}
    };
    window.dkExport = () => { const p=JSON.stringify({_devkit:true,_exported:new Date().toISOString(),entries:load()},null,2); if(navigator.share)navigator.share({title:'DevKit Log',text:p}).catch(()=>{}); else if(navigator.clipboard)navigator.clipboard.writeText(p); };
    window.dkCopyC  = () => { const txt=buildClaudeBlock(),btn=$('dk-cc'); const copy=()=>{if(btn){btn.textContent='✓ Copied!';btn.classList.add('dk-copied');setTimeout(()=>{btn.textContent='📋 Copy Handoff Block';btn.classList.remove('dk-copied');},2500);}}; if(navigator.clipboard)navigator.clipboard.writeText(txt).then(copy); else{const ta=document.createElement('textarea');ta.value=txt;ta.style.cssText='position:fixed;opacity:0';document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);copy();} };
    window.dkClose  = () => { if(dk.panelOpen)togglePanel(); };

    // ── Panel toggle ──────────────────────────────────────────────
    const togglePanel = () => {
      dk.panelOpen=!dk.panelOpen;
      panel.classList.toggle('dk-vis',dk.panelOpen);
      $('dk-toggle').classList.toggle('dk-open',dk.panelOpen);
      if(dk.panelOpen){regenCodeMap();window.dkTab(dk.activeTab);updateBadges();}
      else if(dk.stateTimer){clearInterval(dk.stateTimer);dk.stateTimer=null;}
    };
    const setVisible = v => { dk.visible=v; $('dk-toggle').style.display=v?'flex':'none'; $('dk-version').style.display=v?'block':'none'; if(!v&&dk.panelOpen)togglePanel(); };
    const updateBadges = () => { const sb=$('dk-screen-badge'),mb=$('dk-modal-badge'); if(sb)sb.textContent=getScreen(); const modal=getModal(); if(mb){mb.textContent=modal?'📱 '+modal:'';mb.style.display=modal?'block':'none';} };
    setInterval(()=>{if(dk.panelOpen)updateBadges();},800);
    $('dk-toggle').addEventListener('click',togglePanel);

    // ── Inspector with 3-pass map matching ────────────────────────
    window.dkInspect = () => {
      dk.inspecting=!dk.inspecting;
      const ov=$('dk-inspect-overlay'),bn=$('dk-inspect-banner');
      if(dk.inspecting){
        if(ov){ov.style.display='block';ov.style.pointerEvents='auto';}
        if(bn)bn.style.display='block';
        panel.classList.remove('dk-vis');dk.panelOpen=false;$('dk-toggle').classList.remove('dk-open');
      } else {
        if(ov){ov.style.display='none';ov.style.pointerEvents='none';}
        if(bn)bn.style.display='none';
      }
    };

    const onInspectTap = e => {
      if(!dk.inspecting)return;
      e.preventDefault(); e.stopPropagation();
      const x=e.touches?.[0]?.clientX??e.clientX, y=e.touches?.[0]?.clientY??e.clientY;
      const ov=$('dk-inspect-overlay'),bn=$('dk-inspect-banner');
      if(ov){ov.style.display='none';ov.style.pointerEvents='none';}
      if(bn)bn.style.display='none';
      dk.inspecting=false;
      const target=document.elementFromPoint(x,y);
      if(!target)return;

      // Build ref string
      let ref='',walk=target;
      for(let i=0;i<6;i++){
        if(!walk||walk===document.body)break;
        if(walk.id&&!walk.id.startsWith('dk-')){ref='#'+walk.id;break;}
        if(walk.className&&typeof walk.className==='string'){const cls=walk.className.trim().split(/\s+/).find(c=>c&&!c.startsWith('dk-'));if(cls){ref='.'+cls;break;}}
        walk=walk.parentElement;
      }
      const label=(target.textContent||target.placeholder||'').trim().slice(0,50);
      const fullRef=(ref||'['+target.tagName.toLowerCase()+']')+(label?' · "'+label+'"':'');
      dk.pendingRef=fullRef;

      // Flash element
      target.classList.add('dk-flash');
      setTimeout(()=>target.classList.remove('dk-flash'),600);

      // ── Screen key resolution ────────────────────────────────────
      const screenKey = getScreenKey();
      const modal = getModal();

      // ── 3-pass map matching ──────────────────────────────────────
      let matched=null;
      // Pass 1: exact match
      DKM_ROWS.forEach(row=>{
        if(!row.domHint||matched)return;
        row.domHint.split(',').forEach(h=>{h=h.trim();if(!h||matched)return;try{if(target.matches(h))matched=row;}catch(err){}});
      });
      // Pass 2: ancestor match
      if(!matched)DKM_ROWS.forEach(row=>{
        if(!row.domHint||matched)return;
        row.domHint.split(',').forEach(h=>{h=h.trim();if(!h||matched)return;try{if(target.closest(h))matched=row;}catch(err){}});
      });
      // Pass 3: screen-scoped text fuzzy match
      if(!matched&&label){
        const q=label.toLowerCase();
        DKM_ROWS.filter(r=>r.form===screenKey).forEach(r=>{if(matched)return;if(r.object.toLowerCase().includes(q)||q.includes(r.object.toLowerCase().slice(0,6)))matched=r;});
      }
      dk._tagRowId = matched?matched.id:null;
      dk._tagSnap  = matched?null:{object:label.slice(0,40)||fullRef.split(' · ')[0], form:screenKey, current:'Tapped: '+fullRef+(modal?' in '+modal:'')};

      // Build bubble content
      const elName   = matched?matched.object:(label.slice(0,40)||ref||target.tagName.toLowerCase());
      const sm       = matched?DKM_SCREENS[matched.form]:null;
      const ctxLine  = matched
        ? `<span style="color:#00d9d9">${sm?sm.icon+' '+sm.name:matched.form}</span> · ${matched.type}${matched.status!=='ok'?' · <span style="color:'+(matched.status==='broken'?'#e85d4c':'#ffd700')+'">'+matched.status+'</span>':''}`
        : `<span style="color:#555b6e">${screenKey} · No existing entry — will create new</span>`;

      setTimeout(()=>{
        const bubble=$('dk-confirm-bubble');
        if(!bubble)return;
        bubble.innerHTML=`
          <div class="dk-cb-title">🔍 Element Tagged</div>
          <div class="dk-cb-el">${esc(elName)}</div>
          <div class="dk-cb-ctx">${ctxLine}</div>
          <div class="dk-cb-btns">
            <button class="dk-cb-btn dk-cb-map" onclick="dkmTagConfirm()">Open in Map ›</button>
            <button class="dk-cb-btn dk-cb-log" onclick="dkBubbleLog()">Log Only</button>
          </div>`;
        const vw=window.innerWidth,bw=240,bh=130;
        let bx=Math.min(x-bw/2,vw-bw-12);if(bx<8)bx=8;
        let by=y-bh-14;if(by<60)by=y+14;
        bubble.style.left=bx+'px';bubble.style.top=by+'px';bubble.style.display='block';
        if(bubble._timer)clearTimeout(bubble._timer);
        bubble._timer=setTimeout(()=>{bubble.style.display='none';},8000);
      },50);
    };

    window.dkBubbleLog = () => { const b=$('dk-confirm-bubble');if(b)b.style.display='none'; if(!dk.panelOpen)togglePanel(); window.dkTab('log'); };

    const dismissBubbleOutside = e => {
      const bubble=$('dk-confirm-bubble');
      if(!bubble||bubble.style.display!=='block')return;
      if(bubble.contains(e.target))return;
      setTimeout(()=>{const b=$('dk-confirm-bubble');if(b&&b.style.display==='block'&&!b.contains(e.target)){b.style.display='none';dk.pendingRef=null;}},80);
    };
    document.addEventListener('touchstart',dismissBubbleOutside,{passive:true});
    document.addEventListener('mousedown',dismissBubbleOutside);

    $('dk-inspect-overlay').addEventListener('touchstart',onInspectTap,{passive:false});
    $('dk-inspect-overlay').addEventListener('mousedown',onInspectTap);

    // ── Triple-tap activation ─────────────────────────────────────
    const onHdrTap = () => { dk.tapCount++; if(dk.tapTimer)clearTimeout(dk.tapTimer); dk.tapTimer=setTimeout(()=>{dk.tapCount=0;},600); if(dk.tapCount>=3){dk.tapCount=0;setVisible(!dk.visible);} };
    const wireHdr  = () => { const hdr=document.querySelector('.hdr-title,.hdr-brand'); if(hdr&&!hdr._dkWired){hdr._dkWired=true;hdr.addEventListener('click',onHdrTap);} };
    wireHdr();
    const obs=new MutationObserver(wireHdr);
    obs.observe(document.body,{childList:true,subtree:true});
    setTimeout(()=>obs.disconnect(),10000);
    renderLog();

  }, []); // runs once on mount
  // ── End DevKit ────────────────────────────────────────────────────


  return (
    <>
      <Styles/>
      <div className="app">
        <div className="hdr">
          <div className="hdr-brand">
            <span style={{fontSize:"18px"}}>🌹</span>
            <div>
              <div className="hdr-title">Happy Wife</div>
              <div className="hdr-sub">His Edition · v{APP_VERSION}</div>
            </div>
          </div>
          <div className="pts-badge">
            <div className="pts-val">{points}</div>
            <div className="pts-lbl">HW Points</div>
          </div>
        </div>

        <nav className="nav">
          {TABS.map(t=>(
            <button key={t.id} className={`nbtn${tab===t.id?" active":""}`} onClick={()=>setTab(t.id)}>
              {t.icon} {t.label}
              {t.id==="hints"&&hints.filter(h=>h.status==="active").length>0&&(
                <span style={{background:"var(--gold)",color:"var(--bg)",borderRadius:"10px",padding:"1px 5px",fontSize:"9px",fontFamily:"var(--fm)"}}>
                  {hints.filter(h=>h.status==="active").length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="main">
          {tab==="dashboard" && <Dashboard points={points} tasks={tasks} events={events} hints={hints} taskHistory={taskHistory} setTab={setTab}/>}
          {tab==="honeydо"   && <HoneyDo tasks={tasks} setTasks={setTasks} points={points} setPoints={setPoints} taskHistory={taskHistory} setTaskHistory={setTaskHistory} showToast={showToast} onMutate={onMutate}/>}
          {tab==="rewards"   && <Rewards points={points} setPoints={setPoints} rewardsHer={rewardsHer} setRewardsHer={setRewardsHer} rewardsHim={rewardsHim} setRewardsHim={setRewardsHim} showToast={showToast} onMutate={onMutate}/>}
          {tab==="events"    && <Events events={events} setEvents={setEvents} showToast={showToast} onMutate={onMutate}/>}
          {tab==="dates"       && <DatePlanner dateHistory={dateHist} setDateHistory={setDateHist} dateAxes={dateAxes} setDateAxes={setDateAxes} showToast={showToast}/>}
          {tab==="hints"       && <GiftIntel hints={hints} setHints={setHints} events={events} showToast={showToast} onMutate={onMutate}/>}
          {tab==="compliments" && <ComplimentEngine compHistory={compHistory} setCompHistory={setCompHistory} customComps={customComps} setCustomComps={setCustomComps} showToast={showToast} onMutate={onMutate}/>}
          {tab==="offers"      && <Offers offers={offers} setOffers={setOffers} points={points} setPoints={setPoints} taskHistory={taskHistory} setTaskHistory={setTaskHistory} events={events} showToast={showToast}/>}
          {tab==="herworld"    && <HerWorld herProfile={herProfile} setHerProfile={setHerProfile} showToast={showToast} onMutate={onMutate}/>}
          {tab==="settings"    && <Settings appState={appState} onImport={handleImport} backupLog={backupLog} setBackupLog={setBackupLog} changeCount={changeCount} setChangeCount={setChangeCount} showToast={showToast} devMode={devMode} setDevMode={setDevMode} bugLog={bugLog} setBugLog={setBugLog} sessionNotes={sessionNotes} setSessionNotes={setSessionNotes}/>}
        </div>

        {toast&&<Toast key={toastKey} msg={toast}/>}
      </div>
    </>
  );
}
