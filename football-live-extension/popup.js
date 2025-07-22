document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const GEMINI_API_KEY = 'ADD_GEMINI_API_KEY'; // 🔥 IMPORTANT: Add your Gemini API key here
    const FLASK_LOG_URL = 'http://127.0.0.1:5000/classify_and_log'; // URL to send commentary for logging
    const SIMULATION_SPEED_MS = 4500;

    // --- DOM ELEMENTS ---
    const selectionSection = document.getElementById('selection-section');
    const matchDisplay = document.getElementById('match-display');
    const matchListEl = document.getElementById('match-list');
    const changeMatchButton = document.getElementById('change-match');
    const team1LogoEl = document.getElementById('team1-logo');
    const team1NameEl = document.getElementById('team1-name');
    const team1ScoreEl = document.getElementById('team1-score');
    const team2LogoEl = document.getElementById('team2-logo');
    const team2NameEl = document.getElementById('team2-name');
    const team2ScoreEl = document.getElementById('team2-score');
    const matchTimeEl = document.getElementById('match-time');
    const snippetTextEl = document.getElementById('snippet-text');
    const rawCommentaryTextEl = document.getElementById('raw-commentary-text');
    const loaderEl = document.getElementById('loader');
    const lastUpdatedEl = document.getElementById('last-updated');
    const scorerInfoEl = document.getElementById('scorer-info');
    const scorerTextEl = document.getElementById('scorer-text');
    
    // --- EVENT NOTIFICATION ELEMENTS ---
    const foulInfoEl = document.getElementById('foul-info');
    const foulTextEl = document.getElementById('foul-text');
    const cornerInfoEl = document.getElementById('corner-info');
    const cornerTextEl = document.getElementById('corner-text');
    
    // --- SAMPLE MATCH DATA (for testing) ---
const MATCH_DATA = {
        'psg_vs_chelsea': {
    homeTeam: { name: 'PSG', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Paris_Saint-Germain_F.C..svg/1200px-Paris_Saint-Germain_F.C..svg.png' },
    awayTeam: { name: 'Chelsea', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/1200px-Chelsea_FC.svg.png' },
    events: {
        1: { type: 'commentary', text: "And we are underway! Chelsea get the match started. The roar from the Parisian ultras is deafening." },
        2: { type: 'commentary', text: "Enzo clips a ball towards Reece James, but Nuno Mendes is up quickly to head it back into the Chelsea half." },
        3: { type: 'commentary', text: "Chelsea's tactical shape is apparent. As Colwill carries the ball forward, Cucurella drifts inside to create a numerical advantage in the middle." },
        4: { type: 'commentary', text: "First sign of danger! Vitinha slides a pass into the channel for Mbappé... but the flag is up. Just offside. A warning shot fired." },
        5: { type: 'commentary', text: "Cole Palmer gets his first touches, drifting inside. He tries to nutmeg Ugarte, but the Uruguayan stands his ground." },
        6: { type: 'commentary', text: "Dembélé whips in a dangerous cross towards the near post. Colwill does brilliantly to get in front of his man and head it clear." },
        7: { type: 'commentary', text: "Chelsea are living dangerously. Vitinha nicks the ball off Caicedo! It breaks for Zaïre-Emery on the edge of the box! He shoots! Blocked by Fofana!" },
        8: { type: 'commentary', text: "Dembélé's corner finds Marquinhos, who rises highest! His powerful header is straight at Petrovic, who holds on securely." },
        9: { type: 'commentary', text: "A moment of respite for Chelsea. Jackson draws a foul from Beraldo. Enzo takes it quickly with a 50-yard diagonal to Reece James." },
        10: { type: 'commentary', text: "James drives forward and beats Mendes, but Vitinha has tracked back an incredible distance to slide in and block the cross for a corner." },
        11: { type: 'commentary', text: "Chelsea work a short corner. Mudryk receives the ball inside the box but his first-time shot is wild, high and wide. A wasted opportunity." },
        12: { type: 'commentary', text: "PSG are patient now, moving the ball across the backline, trying to draw Chelsea's press out." },
        13: { type: 'commentary', text: "Magic from Dembélé! He jinks past Cucurella and cuts it back low across the six-yard box. Colwill just gets a vital touch to divert it away from Kolo Muani." },
        14: { type: 'commentary', text: "Chelsea break! Nkunku feeds Jackson, who cuts inside and curls a shot towards the far corner... it's just wide of the post! Donnarumma was scrambling." },
        15: { type: 'commentary', text: "Hakimi flies down the right and delivers a cross. It falls to Mbappé at the back post, but he slices his volley. A rare miscue." },
        16: { type: 'commentary', text: "Petrovic rolls it to Enzo, who clips a perfectly-weighted pass over the top for Mudryk's run, but Hakimi matches him for pace." },
        17: { type: 'commentary', text: "Mbappé drops deep. He lays it off to Vitinha and spins in behind, but Fofana reads it superbly and intercepts." },
        18: { type: 'score', team: 'home', scorer: 'Mbappé', newScore: [1, 0], text: "GOAL FOR PSG! A lightning counter-attack! Vitinha slides an inch-perfect through ball to Mbappé, who is one-on-one and curls it with devastating precision into the far bottom corner." },
        19: { type: 'commentary', text: "Chelsea look shell-shocked. That is the danger you face here. One slip in concentration, and you are punished." },
        20: { type: 'foul', text: "Yellow card. Moisés Caicedo goes into the book for cynically pulling back Dembélé to prevent a counter-attack." },
        21: { type: 'commentary', text: "PSG are buzzing. Zaïre-Emery glides past two challenges and switches play to Mendes, but Reece James is alert to the danger." },
        22: { type: 'commentary', text: "Chelsea manage to string a sequence of passes together, trying to draw the sting out of the game and regain their composure." },
        23: { type: 'commentary', text: "Good play from Chelsea! Jackson's shot is blocked by Marquinhos. The rebound falls to Mudryk, but his effort is comfortable for Donnarumma." },
        24: { type: 'commentary', text: "Hakimi gets to the byline again and crosses. Kolo Muani leaps and heads it down... but Petrovic is there to smother it!" },
        25: { type: 'commentary', text: "A lull in the action as Nuno Mendes receives some treatment. A chance for both teams to take on instructions." },
        26: { type: 'commentary', text: "Mendes is back on his feet and we are back underway. Chelsea have possession, trying to build from the back again." },
        27: { type: 'commentary', text: "Enzo shows his class. Under pressure, he spins away from Vitinha and pings a 60-yard pass to the chest of Reece James." },
        28: { type: 'commentary', text: "James drives at Mendes and finds Nkunku, but Beraldo is sharp and steps in to intercept." },
        29: { type: 'commentary', text: "CHANCE FOR CHELSEA! Oh, they should be level! Palmer slides a defense-splitting pass to Jackson. He only has Donnarumma to beat... but the keeper makes himself huge and saves with his outstretched leg!" },
        30: { type: 'commentary', text: "From the corner, the ball is cleared to Caicedo. He strikes it on the half-volley from 25 yards... it flies a yard over the bar." },
        31: { type: 'foul', text: "Tensions flare up. Ugarte clatters into Nkunku from behind and receives a yellow card. One booking apiece now." },
        32: { type: 'commentary', text: "Palmer curls a free-kick over the wall... it's heading for the top corner! Donnarumma flies across his goal and tips it over the bar! A fantastic save!" },
        33: { type: 'corner', text: "Another Chelsea corner causes a scramble in the six-yard box! PSG are putting their bodies on the line and eventually hack it clear." },
        34: { type: 'commentary', text: "PSG counter! Dembélé slides it to Mbappé... he shoots! Petrovic saves! Kolo Muani follows up... but Colwill appears from nowhere with a phenomenal last-ditch sliding tackle to deny him!" },
        35: { type: 'commentary', text: "This game is utterly breathless. It's like a basketball match. End to end, chance for chance." },
        36: { type: 'commentary', text: "Mudryk uses his pace to knock the ball past Hakimi, but the pass is slightly overhit and Donnarumma gathers." },
        37: { type: 'commentary', text: "Zaïre-Emery pirouettes away from two Chelsea players with unbelievable balance before spraying a pass out to the left." },
        38: { type: 'commentary', text: "Dembélé hits the post! He cuts in from the right and unleashes a ferocious left-footed strike that hammers off the inside of the far post and stays out." },
        39: { type: 'commentary', text: "The Chelsea bench thought that was in. Maresca just shakes his head. You can't legislate for individual brilliance like that." },
        40: { type: 'commentary', text: "Chelsea try to slow the pace down. They need to get to half-time just one goal down." },
        41: { type: 'commentary', text: "Reece James marauds forward and whips in a trademark cross – pacey and vicious. It's just a fraction too high for Jackson." },
        42: { type: 'commentary', text: "A clumsy challenge by Nicolas Jackson on Marquinhos gives away a cheap free-kick." },
        43: { type: 'commentary', text: "Mbappé drives at the Chelsea defence, but Fofana stands him up and makes a strong, clean tackle. Superb defending." },
        44: { type: 'commentary', text: "Enzo Fernández tries another Hollywood pass over the top for Mudryk, but Marquinhos is wise to it and intercepts." },
        45: { type: 'commentary', text: "Two additional minutes will be played." },
        46: { type: 'commentary', text: "Hakimi gets an overlapping run and squares it low... but Caicedo has tracked him all the way and makes a vital block." },
        47: { type: 'commentary', text: "HALF-TIME: PSG 1-0 Chelsea. Donnarumma plucks a final throw-in from the air and the referee blows the whistle." },
        48: { type: 'commentary', text: "And we are back underway for the second half! No changes for either side at the break." },
        49: { type: 'commentary', text: "Chelsea start with purpose. They win the ball back immediately and try to slide in Mudryk, but the pass is just behind him." },
        50: { type: 'commentary', text: "Maresca's instructions are clear: be braver on the ball. Chelsea are dominating possession in these early stages of the half." },
        51: { type: 'commentary', text: "Palmer gets on the ball, plays a one-two with James and whips a dangerous ball towards the far post, but it's just over everyone." },
        52: { type: 'commentary', text: "A long ball is aimed towards Kolo Muani. He battles with Fofana, who does just enough to put the striker off." },
        53: { type: 'commentary', text: "A heart-in-mouth moment for Chelsea as a miscommunication almost lets Kolo Muani in, but Petrovic clears." },
        54: { type: 'commentary', text: "Better from Mudryk. He beats Hakimi and gets to the byline, but his cut-back is behind Nkunku." },
        55: { type: 'score', team: 'away', scorer: 'Nkunku', newScore: [1, 1], text: "GOAL FOR CHELSEA! A beautifully crafted team goal! Palmer slides a perfect no-look reverse pass to Christopher Nkunku, who coolly slots it into the bottom corner." },
        56: { type: 'commentary', text: "The goal has stunned the Parc des Princes into silence. Game on! Maresca claps enthusiastically on the sideline." },
        57: { type: 'commentary', text: "How will PSG respond? Mbappé gets the ball and tries to make something happen on his own, but he's crowded out." },
        58: { type: 'commentary', text: "Chelsea are playing with real confidence now. Fofana strides out of defence, past the halfway line. The dynamic has shifted." },
        59: { type: 'commentary', text: "Dembélé tries to inject some urgency, but his final pass towards Kolo Muani is sloppy and easily intercepted." },
        60: { type: 'foul', text: "Reece James is booked for a little tug on the shoulder of Mbappé to stop a dangerous run." },
        61: { type: 'substitution', text: "PSG substitution. Ousmane Dembélé is replaced by Bradley Barcola, bringing fresh legs to the right wing." },
        62: { type: 'commentary', text: "Mbappé strikes a free-kick with venom! It's a 'knuckleball' effort, but Petrovic watches it all the way and punches it clear." },
        63: { type: 'commentary', text: "The tempo has ramped up again. Vitinha has a crack from 25 yards, but he drags it well wide." },
        64: { type: 'substitution', text: "Chelsea substitution. Mykhailo Mudryk is replaced by Raheem Sterling." },
        65: { type: 'commentary', text: "Penalty shout for PSG! Mbappé goes down under a challenge from Fofana! The referee waves it away!" },
        66: { type: 'commentary', text: "VAR is checking the incident for a potential penalty..." },
        67: { type: 'foul', text: "NO PENALTY! The VAR check is complete. The on-field decision stands. It was a defender's challenge of the highest quality." },
        68: { type: 'corner', text: "The atmosphere is hostile now. Every Chelsea touch is being whistled. Barcola wins a corner for PSG." },
        69: { type: 'corner', text: "The corner is whipped in low and hard by Vitinha, but Beraldo misses the ball completely at the near post." },
        70: { type: 'substitution', text: "Double substitution for PSG. Ugarte and Kolo Muani are off. On come Fabián Ruiz and Gonçalo Ramos." },
        71: { type: 'substitution', text: "Chelsea respond with a change. Nicolas Jackson is replaced by Armando Broja." },
        72: { type: 'commentary', text: "Sterling gets his first run at Mendes but his cross is overhit." },
        73: { type: 'commentary', text: "Fabián Ruiz gets his first touch and immediately looks to dictate the play with a lovely pass out to Barcola." },
        74: { type: 'commentary', text: "Huge chance for PSG! Hakimi cuts the ball back to an unmarked Vitinha, but he leans back and skies it over the bar!" },
        75: { type: 'commentary', text: "What a pass from Enzo Fernández! He splits the entire PSG team to find Sterling, who is in on goal, but Donnarumma dives at his feet to smother the ball." },
        76: { type: 'commentary', text: "Barcola skins Cucurella and delivers a cross. Ramos rises to meet it but Colwill does just enough to put him off." },
        77: { type: 'commentary', text: "Cole Palmer is starting to run the show. He threads a pass to Nkunku, but Marquinhos makes a vital interception." },
        78: { type: 'foul', text: "Yellow card for Fabián Ruiz for hauling down Palmer to stop a break." },
        79: { type: 'commentary', text: "Chelsea win a corner. It's a scramble! Broja stabs at it! Blocked! Caicedo shoots! Blocked! PSG just about survive!" },
        80: { type: 'commentary', text: "Ten minutes of normal time to go. It feels like there's a winner in this game for someone." },
        81: { type: 'commentary', text: "Mbappé cuts inside and curls a shot... it's deflected! Petrovic has to backtrack nervously to tip it over his own crossbar!" },
        82: { type: 'corner', text: "From the corner, the ball finds its way to Marquinhos at the back post, but his volley is deflected for another corner." },
        83: { type: 'substitution', text: "Chelsea substitution. Nkunku, the goalscorer, is replaced by Trevoh Chalobah for a defensive switch." },
        84: { type: 'commentary', text: "The change means Chelsea are switching to a back five to try and see this out." },
        85: { type: 'commentary', text: "Fabián Ruiz threads a pass into the box for Ramos, but Chalobah makes a brilliant block on Zaïre-Emery's shot." },
        86: { type: 'foul', text: "Another penalty shout as Barcola goes down in the box! The referee waves play on again." },
        87: { type: 'commentary', text: "Chelsea are pinned back. A cross comes in from Mendes... Ramos gets up... but his header is just over the bar!" },
        88: { type: 'score', team: 'home', scorer: 'Mbappé', newScore: [2, 1], text: "GOAL FOR PSG! Heartbreak for Chelsea! Hakimi delivers a sensational first-time cross and Mbappé meets it on the full volley, smashing it into the roof of the net!" },
        89: { type: 'commentary', text: "Mbappé celebrates in front of the ultras. He has delivered again on the biggest stage." },
        90: { type: 'commentary', text: "The fourth official indicates there will be a minimum of eight added minutes." },
        91: { type: 'commentary', text: "Chelsea try to respond. Enzo Fernández launches a long ball towards Broja, but Marquinhos heads it clear." },
        92: { type: 'substitution', text: "PSG substitution to waste time. Zaïre-Emery is replaced by Danilo Pereira." },
        93: { type: 'foul', text: "Yellow card for Petrovic for time-wasting over a goal kick." },
        94: { type: 'commentary', text: "Chelsea free kick near the halfway line. Colwill gets his head to it but Donnarumma punches clear." },
        95: { type: 'corner', text: "Frantic stuff now. Palmer wriggles past two challenges and shoots! It's deflected just wide for a corner!" },
        96: { type: 'corner', text: "Last chance for Chelsea! The keeper is up for the corner! Fofana gets his head on it... but it flies agonisingly over the crossbar!" },
        97: { type: 'commentary', text: "Donnarumma takes his time with the goal kick. The seconds are ticking away." },
        98: { type: 'commentary', text: "FULL-TIME: PSG 2-1 Chelsea. The final whistle blows! PSG take a slender first-leg advantage after a dramatic and thrilling Champions League night." }
    }
},
"man_utd_vs_man_city": {
    "homeTeam": { "name": "MUN", "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Manchester_United_FC_crest.svg/1200px-Manchester_United_FC_crest.svg.png" },
    "awayTeam": { "name": "MCI", "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/1200px-Manchester_City_FC_badge.svg.png" },
    "events": {
      "0": { "type": "commentary", "text": "Welcome to Old Trafford! The Theatre of Dreams is a cauldron of noise. Red scarves waving like wildfire. Kickoff under the floodlights—it’s Manchester United kicking off from right to left, wearing their classic red with black trim. City in their sky blue, poised and clinical. Erik ten Hag stands arms folded, Pep Guardiola bouncing on his toes with manic energy. We’re underway!" },
      "1": { "type": "commentary", "text": "City immediately assert themselves with early possession. Rodri touches it, then back to Dias. They’re building patiently from the back. De Bruyne drops deep, linking with Stones. United in their mid-block, with Bruno pressing the pivot. Garnacho already looks sharp—he’s nipping at Walker’s heels. The intensity is unreal. Rashford leads a sprint press—forces Ederson into an early long ball that Varane heads down cleanly. The crowd roars in approval." },
      "2": { "type": "commentary", "text": "United now in possession. Casemiro receives from Onana, swivels neatly under pressure from Foden. Casemiro threads one through the lines—finds Fernandes between City’s midfield strata. Bruno turns, looks up—GOES LONG! Rashford is chasing! But Ederson is off his line early and clears it into touch. A little early warning from United: they will go direct when space opens up." },
      "3": { "type": "commentary", "text": "City regain control. De Bruyne drops into the left half-space, gives it to Bernardo Silva, who flicks it back to Grealish. Grealish with that slow-glide dribble, facing Dalot. He shimmies left, cuts right, lays it off to Rodri. Rodri from 30 yards... he has a look... SHOOTS! Wide. But that came from five uninterrupted passes. That’s City—a python tightening with every touch." },
      "4": { "type": "commentary", "text": "United not shying away though. Casemiro picks Grealish’s pocket and launches a counter. Garnacho takes off on the right—he's got space! Darts past Gvardiol—whips in a curling cross! Cleared by Stones! Rebound falls to McTominay—he HITS IT! Blocked again by Rodri who slid across. Brave defending. The fans are loving this end-to-end edge." },
      "5": { "type": "commentary", "text": "Guardiola is already out in his technical area, animatedly signaling for compactness in midfield. City look to settle again. Alvarez and De Bruyne rotate, causing a brief mismatch. Ball with Walker—he darts forward this time—slips a disguised ball to Foden! In the box! Shoots near post—SAVED by Onana! Big moment! The Cameroon keeper is up to the task." },
      "6": { "type": "commentary", "text": "Corner to City. De Bruyne swings it in—a deep one! Dias rises—he nods it toward goal—cleared off the line by Garnacho! The teenager putting in the hard yards on both ends. City recycle it. Silva to Grealish—he flicks it over Dalot—ohh, cheeky! Pulls it back—but Casemiro intercepts. The Brazilian maestro is rolling back the years tonight." },
      "7": { "type": "commentary", "text": "United launch another attack. Onana rolls it short this time, inviting City’s press. It’s risky—but Casemiro pirouettes under pressure, then lays it off to Varane. Long diagonal to Rashford—he cushions it brilliantly on the chest. Turns Walker! Shoots from a tight angle—just wide! The crowd rises as one. That’s vintage Rashford, direct and devastating." },
      "8": { "type": "commentary", "text": "City now increase the tempo. Rodri to Stones to De Bruyne—first time pass to Foden who ghosts between Shaw and Varane. Slips it to Alvarez—edge of the D. One touch—turns—SHOOTS! Blocked! Varane throws himself into the line of fire. That’s world-class defending. Every touch is a threat. You can feel the tension ratcheting up." },
      "9": { "type": "commentary", "text": "Frenetic pace now. Bruno is barking orders, Rashford clapping his hands, urging the press. United are in a 4-4-2 out of possession, pressing triggers triggered every time the ball goes wide. City are adjusting—Stones inverts into midfield now. Bernardo overlaps Walker—it’s a chessboard with jet engines." },
      "10": { "type": "commentary", "text": "We hit ten minutes and there’s barely been time to breathe. Possession favors City, but United have had the clearer shot on goal. Tactical discipline meets tactical chaos. The stadium is thunderous. No goals yet—but the tension is tangible, like storm clouds ready to burst. You just know something is coming." },
      "11": { "type": "commentary", "text": "De Bruyne begins to dictate again—City rotating triangles on the right now. Walker to Silva, back to Walker, slips it between the lines to De Bruyne. He looks up—switches it diagonally to Grealish on the left! It’s inch-perfect! Grealish brings it down—fakes inside—lays it to Rodri—who threads it to Alvarez—SHOT BLOCKED AGAIN! Lisandro Martinez this time. It’s heroic defending from United." },
      "12": { "type": "commentary", "text": "Old Trafford erupts as United counter at blistering speed. Garnacho picks up the loose ball, skips inside one, two blue shirts! He lays it into Bruno Fernandes—Bruno chips it forward—Rashford is in behind! But Ederson rushes out like a sweeper-keeper and boots it away! That was inches from a 1-v-1! The crowd gasps, Guardiola is losing his mind on the touchline!" },
      "13": { "type": "commentary", "text": "City respond immediately. It’s now relentless back-and-forth. Foden combines with Stones, who has completely taken up a midfield role now. He slides it into De Bruyne—first-time ball to Grealish again! He goes for the byline—pulls it back across goal! But there’s no one there! Alvarez was a step late. United breathe." },
      "14": { "type": "commentary", "text": "Casemiro slows it down for United. He shields, swivels, and passes to Shaw who finds Bruno in the left half-space. Fernandes has space! He threads a low ball to Rashford who turns—SHOOTS from 25 yards! STINGS the palms of Ederson! Great strike! Still goalless but you wouldn’t know it from the drama!" },
      "15": { "type": "commentary", "text": "Fifteen minutes gone and it’s a tactical arms race. Stones is essentially a No. 6 now, and Rodri drops into the backline. Guardiola adjusting like it’s a chess match. Ten Hag shouts for McTominay to push up between City’s lines. United’s pressing shape morphs into a 4-3-3. This is high-level strategy on the fly." },
      "16": { "type": "commentary", "text": "City almost carve United open. De Bruyne drops between the lines, receives from Rodri, turns—and fires a through ball that splits the center-backs—Foden’s in! One touch—tries to chip Onana—JUST OVER! Heart-in-mouth stuff for United! That pass from De Bruyne was surgical." },
      "17": { "type": "commentary", "text": "Garnacho is United’s livewire. He’s got the ball again—takes on Gvardiol—burns past him! Into the box! Pulls it across to Rashford! Shot—DEFLECTED! Loops into the air—and Ederson punches it clear under pressure from McTominay. It's carnage in City’s penalty box!" },
      "18": { "type": "commentary", "text": "Another attack, another interception—this time by Rodri. He’s everywhere—recycles possession calmly, then goes vertical to Alvarez. Alvarez holds it up—waits—lays it to De Bruyne, who chips it over the top—Foden’s in again! Controls! SHOOTS—BLOCKED by Varane again! United are throwing bodies like it’s a warzone." },
      "19": { "type": "commentary", "text": "Guardiola applauds the buildup but his face is stone. He knows these missed chances could come back to haunt. City dominate possession now—71%—but United’s threat in transition is real. Shaw and Dalot are tucked in narrow, almost forming a back five out of possession. Ten Hag’s plan is clear: compress, survive, break." },
      "20": { "type": "commentary", "text": "Still no goals, but you’d think it’s 3–3 with the energy inside Old Trafford. Every challenge, every flick, every break is met with roars. Both teams have tested the keepers, defenders are blocking like their lives depend on it, and the tempo is ferocious. The stage is set—something’s going to give soon." },
      "21": { "type": "commentary", "text": "City control the tempo again. Rodri pings it to Stones who has fully stepped into midfield. He drives forward like a number eight now—finds Bernardo Silva, who’s drifting central. Silva dinks it to De Bruyne—tight angle on the edge of the box—he cuts in—SHOOTS! Over the bar! But that was clever movement. United are having to defend on a knife’s edge." },
      "22": { "type": "commentary", "text": "United try to escape the pressure—Onana goes long. Rashford challenges Walker in the air—brings it down! Flicks it wide to Garnacho. The Argentine sprints—past Gvardiol again! He’s into the box—low cross! McTominay meets it! Blocks! Chaos! And then it’s scrambled away by Dias. This is breathless football." },
      "23": { "type": "commentary", "text": "Guardiola is screaming for composure—he’s calling Stones over, urging calm. City reset. Rodri drops deep, inviting the ball. Walker holds the width, hugging the right touchline. They’re spacing the pitch again. Grealish calls for it on the left—Rodri finds him. 1v1 with Dalot again. Grealish drops the shoulder—cross comes in—too close to Onana who claims it well." },
      "24": { "type": "commentary", "text": "Onana wastes no time—rolls it to Martinez. He splits the lines with a pass to Bruno Fernandes. Bruno swivels, advances—slides it to Shaw overlapping. Shaw looks up—low ball into the box! Rashford dummies! McTominay shoots! BLOCKED by Dias this time. Incredible defending again. Every time United come forward, they carry danger." },
      "25": { "type": "commentary", "text": "We’re now 25 minutes in and it’s still 0–0, but it’s been a whirlwind. Both teams committed to their identities. City with their control, their rotations. United—vertical, opportunistic, deadly in transition. Casemiro and Rodri are playing like warriors. This feels like a final, not a league match." },
      "26": { "type": "commentary", "text": "City go again. Stones receives centrally—finds De Bruyne in space. He looks left, finds Grealish again. He slows the tempo—waits—drags Dalot with him—lays it square to Silva—one-touch to Alvarez at the top of the D! First-time effort! Onana saves again! Spills it! But pounces on the rebound before Foden can follow up. Close call!" },
      "27": { "type": "commentary", "text": "United surge forward again. Martinez with a daring carry out of defense—beats one—beats two—lays it to Garnacho who’s become a constant menace. He squares it—Bruno lets it run—Rashford hits it first time! It’s wide again! Just lacked the bend. But the build-up—liquid football from back to front." },
      "28": { "type": "commentary", "text": "Pep Guardiola is crouching now, intensely murmuring to his bench. He knows United are one clinical strike from taking the lead. Stones gestures to Rodri—they’re trying to compress the center. Meanwhile, Foden floats wide, dragging Shaw out. That creates a gap—Alvarez tries to exploit it—receives—turns—shoots—HIGH AND WIDE! That one flew into the Stretford End." },
      "29": { "type": "commentary", "text": "Dalot now carries forward for United—he’s hardly had a second to breathe but goes again. Combines with Garnacho down the right. Garnacho flicks it back—Dalot crosses deep—Rashford peels to the back post—heads it! But it’s looping, and Ederson collects calmly. United’s direct play continues to stretch City’s shape." },
      "30": { "type": "commentary", "text": "Half an hour in. What a derby. The stats say 0–0, but the hearts in this stadium know otherwise. The volume remains deafening. Every challenge is met with an eruption. United fans sing ‘20 times, 20 times Man United…’ City fans whistle back. It’s as intense off the pitch as on it. This match is on a razor’s edge." },
      "31": { "type": "commentary", "text": "City resume their rhythmic passing. Dias to Rodri—he pauses, looks up, then finds Stones who’s orchestrating like a deep-lying conductor now. Stones clips it to Bernardo Silva in the half-space—he spins Casemiro beautifully! Silva glides forward, dinks it into Foden—tight control! Edge of the six-yard box—tries to drag it back… but Martinez slides in and hooks it clear! Brilliant anticipation!" },
      "32": { "type": "commentary", "text": "City corner. De Bruyne to take. Arms raised. Outswinger to the near post—flicked on by Alvarez! VARANE HEADS OFF THE BAR! Off the bar! Pandemonium in the box! McTominay hammers it clear—only to halfway. Danger averted. But United rode their luck there. The crossbar still shaking." },
      "33": { "type": "commentary", "text": "United regroup and counter again. Bruno Fernandes, ever alert, picks up a loose pass. He immediately turns and drives forward—he’s got Rashford on the left. Rolls it wide. Rashford cuts in—GOES FOR GOAL FROM RANGE! Fizzes just past the post! Ederson had it covered... barely. The shot had venom." },
      "34": { "type": "commentary", "text": "Now Grealish drops deep to pull Dalot with him. It’s a tactical trap—Rodri rushes into the space vacated—receives from De Bruyne—drives into the final third—threads it into Alvarez. He turns! SHOOTS! SAVED AGAIN! Onana parries and yells at his backline. The Cameroonian has been immense." },
      "35": { "type": "commentary", "text": "United fans rise in defiance. Chants of ‘UNITED! UNITED!’ ring around Old Trafford. Garnacho feeds off it—receives from Casemiro and bursts down the right. He races past Gvardiol again—he’s electric tonight. Pulls it back to the edge—McTominay again! This time he side-foots it… wide! Inches! Ederson was rooted!" },
      "36": { "type": "commentary", "text": "The game is teetering—like a high-speed game of poker. Both sides pushing chips to the center of the table. De Bruyne tries a no-look pass—cut out by Martinez. Shaw intercepts the loose ball, flips it to Bruno. Another vertical ball to Rashford—he’s in behind! 1v1… flag goes up late! Offside! Marginal." },
      "37": { "type": "commentary", "text": "City slow it down just a fraction now. They pass around with surgical patience—72% possession but United are letting them have it wide. Bernardo and Walker try a one-two to unpick the flank—but Shaw reads it and shepherds it out. Ten Hag applauds—he’s coaching every second." },
      "38": { "type": "commentary", "text": "Guardiola makes an early gesture—signals to Foden and Stones. Stones now drops back in line with Rodri—they’re switching to a 3-2 build-up. Walker flies forward with that license. De Bruyne finds him—cross from deep! Alvarez jumps! But it’s just over his head. Dalot nods it away on the stretch." },
      "39": { "type": "commentary", "text": "Onana restarts fast again—goal kick low and flat to Martinez. He punches it through three lines to Fernandes! Superb pass! Bruno turns—spreads it to Garnacho. He delays—then stabs it through to Rashford! He’s away! The stadium roars! Rashford one-on-one… Ederson closes… RASHFORD SHOOTS—EDERSON SAVES! Huge moment! Best chance of the match!" },
      "40": { "type": "commentary", "text": "Old Trafford is ALIVE. The fans are baying. United had the breakthrough at their fingertips. Rashford looks skyward. Ederson pounds his chest. The drama is boiling. We’ve hit 40 and still no goal, but every moment feels like it's the one. Football on the edge. This is why we watch." },
      "41": { "type": "commentary", "text": "City respond with venom. Rodri demands the ball off Ederson and initiates the build-up with swagger. He turns smoothly past Bruno, lays it off to De Bruyne, who’s now floating in pockets all over. De Bruyne glances, then lofts it over United’s backline—Grealish controls on his chest inside the box! Shoots on the half-volley—ONANA SAVES AGAIN! A strong hand to palm it away! The reflexes!" },
      "42": { "type": "commentary", "text": "Corner City—again De Bruyne takes. This one is flatter, faster—Dias gets a toe on it at the front post! It ricochets off Varane—bounces dangerously—Grealish tries to volley—blocked by Dalot! Penalty shouts from the City fans—but Michael Oliver waves play on. Replays show it came off Dalot’s chest, not arm. No penalty." },
      "43": { "type": "commentary", "text": "United try to breathe—Casemiro does a little samba shake to escape pressure. He threads it to McTominay, who turns, then slips it between the lines to Bruno—first time to Rashford! It’s liquid! Rashford sprints down the left again—he’s inside the box—GOES NEAR POST! Side-netting. Half the stadium thought it was in!" },
      "44": { "type": "commentary", "text": "Guardiola is furiously scribbling in his notebook—he looks unsettled. Ten Hag, meanwhile, is urging composure, holding his palm out to Bruno like a conductor steadying a symphony. Both managers know: a goal now, just before half-time, could tilt the match entirely." },
      "45": { "type": "commentary", "text": "We hit the 45th minute—4 minutes of added time signaled! And rightly so—it’s been non-stop action. Stones takes initiative again, stepping into United’s half with purpose. He fires a pass into Foden—lays it off to De Bruyne—instant return to Foden! In behind—he shoots! SAVED AGAIN by Onana! His fourth big stop of the half! World-class performance!" },
      "46": { "type": "commentary", "text": "United break instantly. Onana hurls it like a javelin to Garnacho on the right wing. He barely takes a touch—just charges! He cuts inside on Gvardiol, then outside—beats him for pace—gets to the byline—floats a cross! Rashford meets it—HEADS! Over the bar! Glorious chance! He hangs his head. United getting closer." },
      "47": { "type": "commentary", "text": "City hold possession to drain the tempo a bit. Rodri gestures to slow things down. It’s worked side-to-side. Bernardo Silva tries to draw Shaw out with a feint—cuts it back to Walker who drills in a low ball—Martinez intercepts. He’s been a colossus. The Argentine celebrates it like a goal. That’s what this derby means." },
      "48": { "type": "commentary", "text": "Last chance before the break? Bruno Fernandes has the ball centrally—he slows, scans—slides a clever through ball for McTominay making a run! He’s onside! Into the box! McTominay winds up—BLOCKED by Rodri again! That man never stops. Absolute warrior." },
      "49": { "type": "commentary", "text": "HALF-TIME WHISTLE! What. A. Half. No goals, but who needs them with this kind of drama? Onana with a goalkeeping masterclass. Rashford and Garnacho electric. City controlling, probing, surgical—but United have sliced them open with vertical venom. Old Trafford is standing and applauding both sides. It’s 0–0, but it’s a fireball of a derby." },
      "50": { "type": "commentary", "text": "Back underway and the noise has gone up a notch! United kick us off this time. Ten Hag has made no changes—neither has Guardiola. Everyone on the edge of their seats. Bruno immediately goes long, looking for Rashford down the left flank. It’s overhit—but that intent, again, is immediate." },
      "51": { "type": "commentary", "text": "City settle quickly. Rodri with his usual calmness. He finds Stones, who’s practically playing as a pivot now. Walker sprints down the right, receives—squares it in low. Foden dummies—Alvarez picks it up—twists! SHOOTS! Straight at Onana! But still—within 30 seconds, City find a shooting lane. Ruthless." },
      "52": { "type": "commentary", "text": "United up the tempo again. Casemiro with a sharp interception and he’s off! Plays it to Bruno—who dinks it over the top for Garnacho. He’s in! He’s in behind Gvardiol! Into the box—opens his body—SHOOTS… side-netting again! So close! Ederson was rooted. United fans were already up." },
      "53": { "type": "commentary", "text": "City now dial the pressure to max. Quick passes in tight triangles—Bernardo, De Bruyne, Stones—all in a phone booth. They break the lines—Grealish slips one to Alvarez—lovely backheel flick to Foden! Shot from the edge! Wide again! The fluidity of movement is dazzling. But the finish still eludes." },
      "54": { "type": "commentary", "text": "Old Trafford is absolutely rocking. Both managers pacing like wild animals. The match is screaming for a goal, but the defending from both teams has been monumental. The tactical battle continues: Stones stays inverted, Rashford stays high, ready to pounce. It's like a chessboard strapped to a racecar. Still 0–0—but the pressure is ready to erupt." },
      "55": { "type": "commentary", "text": "City step up the gears. Rodri again the anchor—he collects from Dias, bounces it off Stones, then drives forward himself. He’s got Alvarez to his left—slides it through! Alvarez in the box—cuts inside Martinez! Shoots! DEFLECTED wide by Varane’s outstretched leg! The Frenchman throws his hands up and roars. It’s been a heroic backline display." },
      "56": { "type": "commentary", "text": "De Bruyne jogs over—City’s sixth corner. He whips it in with venom to the back post—Dias rises! Heads it back across! Foden volleys—OVER! Inches above the crossbar. That was nearly a highlight reel strike. Guardiola crouches and covers his face. The finishing just isn’t clicking for City." },
      "57": { "type": "commentary", "text": "United respond with pure speed. Onana punches the goal kick short to Casemiro—who immediately lasers a diagonal ball to Garnacho. He controls it like glue—one touch to beat Gvardiol—he’s in the box! Pulls it back! McTominay strikes! BLOCKED—AGAIN—by Rodri sliding across like a bodyguard. How many blocks has he made tonight?" },
      "58": { "type": "commentary", "text": "Old Trafford is a frenzy. You can feel it—one spark and the roof will come off. Bruno Fernandes is orchestrating again—he’s everywhere. This time he’s popped up on the left—one-two with Shaw—into the half-space—he chips it into Rashford! Chests it—shoots! Straight at Ederson! But the move was lovely." },
      "59": { "type": "commentary", "text": "City wrestle back possession and slow things down again. Stones moves deep, controlling rhythm like a metronome. Bernardo Silva ghosts past Shaw and receives on the overlap. Quick feet, low cross—cleared by Martinez at the near post! He’s been flawless. Shaw nods away the rebound. Every time City think they’ve opened the door—bam—it’s slammed shut." },
      "60": { "type": "commentary", "text": "De Bruyne now drifts to the left—trying to pull Dalot out. Grealish makes an inverted run—De Bruyne finds him—1v1 with Varane. Grealish hesitates, then bursts forward—flicks it with the outside of the boot—cutback! Foden arrives! SHOOTS—WIDE AGAIN! It takes a deflection! Another corner! The misses are racking up." },
      "61": { "type": "commentary", "text": "Corner number seven. This one short—Bernardo to De Bruyne—De Bruyne dinks it high to the far post—Stones rises! Heads it back into the six-yard area—nobody there! Onana plucks it from the sky and clutches it like it’s gold. He’s taking a moment, letting the clock breathe. The crowd appreciates him tonight." },
      "62": { "type": "commentary", "text": "Suddenly United spring again—Onana’s distribution has been outstanding. He slings it to Shaw this time. Shaw gallops forward, unchallenged—rolls it to Bruno who’s switched sides again. Bruno cuts inside—GOES FOR GOAL FROM RANGE! Ohhh! It flashes just past the top corner! Ederson was at full stretch. Inches. Centimeters." },
      "63": { "type": "commentary", "text": "Pep Guardiola is barking at De Bruyne, then at Rodri—he wants quicker transition through the thirds. City obey. Rodri zips it to Stones—Stones pops it to Alvarez who spins Casemiro! Quick ball to Foden—lovely flick to Silva—CROSS! Blocked by Shaw. And now Garnacho is running again! You blink and it changes direction." },
      "64": { "type": "commentary", "text": "One hour played. Still somehow goalless. But this is heavyweight football—every duel is a clash of styles, every inch contested like the final battle of a war film. The midfield battle is ferocious, the defensive lines heroic, and the goalkeepers brilliant. You just know… something seismic is building." },
      "65": { "type": "substitution", "team": "away", "playerIn": "Doku", "playerOut": "Alvarez", "text": "Guardiola is pacing furiously now—he’s seen enough. He motions to his bench. Julián Alvarez gets a pat on the back—he’s coming off. Jeremy Doku is stripped and ready. A tactical shift is coming—more directness, more one-on-one chaos. De Bruyne gives Doku a quick whisper—probably telling him: ‘Run at them. Relentlessly.’" },
      "66": { "type": "commentary", "text": "Substitution: City bring on Doku for Alvarez. Foden now central, Silva tucking deeper, and Doku takes the left flank. United stay unchanged—for now. Ten Hag watching calmly, but inside you can feel him processing adjustments. It’s still a chess match." },
      "67": { "type": "commentary", "text": "Doku’s first touch—electric. He gets the ball on the left and immediately squares up Dalot. He feints, steps over—goes outside, then back in. Cuts inside—shoots low! Blocked by Martinez! Again! The Argentine throws his body at it like a brick wall. The crowd explodes in appreciation." },
      "68": { "type": "commentary", "text": "United try to play through the press but it’s intense now. Rodri has pushed up. He intercepts a Shaw pass and plays it square to Foden. Foden dances around McTominay—edge of the box—feeds it to De Bruyne—quick shot! Tipped over by Onana! Yet another brilliant save! That’s SIX now. He’s possessed tonight." },
      "69": { "type": "commentary", "text": "De Bruyne trots over—City corner number nine. He whips in another fizzing outswinger—Dias again rises! Glancing header—just wide! Everyone in blue thought that was it! Dias slaps the turf in frustration. United surviving—but how long can they?" },
      "70": { "type": "commentary", "text": "United suddenly burst to life. Bruno Fernandes with the interception of dreams—he reads a careless Rodri pass, controls it instantly, and chips it over the top to Rashford! Rashford is in behind! Gvardiol chasing—Rashford takes a touch—SHOOTS—EDERSON SAVES! His biggest save yet! This match is pure madness!" },
      "71": { "type": "commentary", "text": "Old Trafford is shaking! The fans are on their feet. Scarves raised. ‘Glory Glory Man United’ echoing from the Stretford End. They sense it. They believe. But so does City. This is the kind of match where legends are made." },
      "72": { "type": "commentary", "text": "City now looking slightly rattled. A rare lapse. Bruno again picks a pocket—this time of Silva. He slides it to Garnacho, who takes on Gvardiol—beats him again! Low cross—McTominay arriving! MISSES the contact! Huge chance! United’s third clear-cut opportunity of the half goes begging." },
      "73": { "type": "commentary", "text": "Guardiola barks again—urgently calling for more discipline in midfield. Stones steps back into defense temporarily—Rodri becomes the lone pivot. It’s now a front five for City: Doku, Foden, Grealish, De Bruyne, Silva all rotating in lightning patterns. Can United withstand this blizzard?" },
      "74": { "type": "commentary", "text": "City shift it left to Doku again—Dalot in a deep stance. Doku slows—then accelerates with a sudden jolt! Past one, two! Into the box! Fires it across goal—Onana dives! FINGERTIPS IT AWAY! It falls to Grealish at the far post! Grealish SHOOTS—BLOCKED BY VARANE ON THE LINE! Heroic! UNREAL DEFENDING!" },
      "75": { "type": "commentary", "text": "City refuse to relent. De Bruyne drops deep, grabs the ball, and drives with that unmistakable glide. He cuts inside—lays it to Silva—one-touch to Foden—backheel to Rodri! Rodri from 25 yards—UNLEASHES—WHISTLES JUST OVER THE BAR! The net was begging. But the shot bent just a whisker too high." },
      "76": { "type": "substitution", "team": "home", "playerIn": "Eriksen", "playerOut": "McTominay", "text": "Ten Hag makes a move. Substitution: Christian Eriksen replaces McTominay. Fresh legs, more control in midfield. McTominay has run himself into the ground. Eriksen immediately starts instructing—pointing, repositioning Casemiro and Bruno. He’s Ten Hag’s on-field conductor now." },
      "77": { "type": "commentary", "text": "United string together some possession now. A rare luxury tonight. Eriksen and Casemiro combine to slow the tempo. Bruno checks to receive, and it’s worked wide to Dalot. Dalot pings it into Rashford—who lays it back to Bruno—CURLING SHOT! SAVED BY EDERSON! Full stretch to his right. That ball was heading top bins!" },
      "78": { "type": "commentary", "text": "Doku again! He’s a cheat code on the dribble. He torches Dalot again, leaves Casemiro in his wake, cuts inside—GOES NEAR POST! Onana beats it out! The parry falls to Foden—blocked again by Martinez! The man is defending like a possessed warrior. He’s earning every drop of applause tonight." },
      "79": { "type": "commentary", "text": "Fifteen minutes remain. And now the tension is unbearable. One mistake—one moment of genius—one set-piece could settle this. Both managers remain animated: Ten Hag calm but intense, Guardiola gesturing frantically. You can feel the stormclouds tightening." },
      "80": { "type": "substitution", "team": "home", "playerIn": "Antony", "playerOut": "Garnacho", "text": "United make another change: Antony on for Garnacho. The Argentine walks off to a standing ovation—he’s been electric. Antony sprints on, claps his hands, and immediately shouts to Dalot. You know what he brings—inverted runs, tricky footwork, and a hunger to shoot." },
      "81": { "type": "commentary", "text": "Antony gets his first touch. Eriksen finds him with a clever switch. Antony cuts inside Gvardiol, shaping to shoot—then drags it back! Lays it to Bruno—he lets fly! Blocked by Dias! The deflections are endless. This is a battlefield disguised as a football pitch." },
      "82": { "type": "commentary", "text": "City respond with frightening fluidity. De Bruyne again finding pockets. He shifts left—plays it to Doku—one touch inside, then wide to Grealish—CROSS TO FODEN! Header! SAVED BY ONANA AGAIN! He pounces on the rebound like a lion on raw meat. Nine saves now. Nine." },
      "83": { "type": "commentary", "text": "Every clearance, every duel now brings a roar from the crowd. Shaw intercepts a De Bruyne through ball and pumps his fist. It’s war out there. Eriksen calms things, holds the ball under pressure, and feeds Casemiro who finds Rashford. Rashford turns—surges forward—he’s past Stones! Into the box—SHOOTS—DEFLECTED WIDE! Corner United!" },
      "84": { "type": "commentary", "text": "Old Trafford rises. Bruno steps over to take the corner. Deep breath. He swings it in far post—VARANE RISES! HEADS IT DOWN—OFF THE POST! The rebound spills—Martinez lashes at it—BLOCKED ON THE LINE BY WALKER! Unbelievable! Scenes of disbelief! The football gods are teasing both sides." },
      "85": { "type": "commentary", "text": "City back in possession, and Pep is urging one final push. De Bruyne drops into a quasi-left-back role to orchestrate. He floats a long diagonal to Walker—perfect weight—Walker controls on the edge—cuts inside Shaw—low ball in! Foden meets it—BACKHEEL ATTEMPT! Onana saves again! Sprawling low to his left! Insane reflexes!" },
      "86": { "type": "commentary", "text": "United’s turn. Eriksen finds Rashford on the counter—he’s charging at Dias now. Step-over, burst, low cross—ANTONY ARRIVES! SHOOTS—DEFLECTED WIDE! Bruno grabs the ball for another corner. The fans are screaming now. Everyone knows what a single goal means at this point." },
      "87": { "type": "commentary", "text": "Corner United. Bruno swings it near post—VARANE FLICKS—Casemiro attacks it! Header on target—SAVED! EDERSON WITH A STRONG WRIST! Parried to safety. The match is now a tornado of corners, shots, blocks, screams, prayer. This is a modern classic. And we don’t even have a goal." },
      "88": { "type": "commentary", "text": "Doku on the left again—he’s gone from threat to plague. Dalot backs off—too wary of the take-on. Doku drives into the box—pulls it back! De Bruyne arrives! Lashes at it—WIDE! Slices across it horribly. He slaps his thigh and glares at the turf. Another golden chance goes begging." },
      "89": { "type": "substitution", "team": "home", "playerIn": "Højlund", "playerOut": "Rashford", "text": "Substitution for United: Højlund enters for Rashford, who earns a standing ovation. Ten Hag wants a focal point now. Højlund immediately presses high—arms spread, shouting at teammates to come up with him. He’s fired up. City look nervy. They know they’ve let United live too long." },
      "90": { "type": "commentary", "text": "Foden drifts into the half-space—plays a clever disguised pass to Bernardo Silva inside the box. He shifts onto his left—CUTS BACK TO GREALISH! SHOT—MARTINEZ BLOCKS! AGAIN! Martinez, bleeding from a clash earlier, continues to throw himself into the fire. It’s gladiatorial." },
      "91": { "type": "commentary", "text": "United break—Antony sprints like a man possessed. He carries from his own half, leaves Rodri spinning—plays a slick one-two with Eriksen. Antony now top of the box—HE SHOOTS! CURLING! JUST OVER! The net rippled, but the wrong side. Ederson watches it like a missile trail." },
      "92": { "type": "commentary", "text": "City holding the ball now, trying to draw United out. Rodri, Stones, and De Bruyne pass it in a triangle of death. But Bruno charges in—wins it! Bruno’s away—slides it to Højlund! He holds off Dias! SHOOTS! BLOCKED BY WALKER! That could’ve been the one! Walker’s tackle was inch-perfect." },
      "93": { "type": "commentary", "text": "Tension thicker than Manchester fog. Pep’s shouting at Grealish to tuck in, at Walker to overlap. Meanwhile, Ten Hag has both fists clenched, barking encouragement in Dutch. It’s full madness now. Players are cramping. Fans are pacing. Time is running out." },
      "94": { "type": "commentary", "text": "Into the final minute of the 90. Eriksen with one more magical pass—threads it through to Bruno—he’s got a yard on Rodri! Bruno into the box—low cross to Højlund—STICKS A FOOT OUT—GOES WIDE! Inches! United fans bury their heads in disbelief. That was it." },
      "95": { "type": "commentary", "text": "United immediately go on the offensive. Antony races to collect a switch from Bruno, brings it down with velvet control. Cuts in, drops Gvardiol to the turf—feeds Eriksen top of the box! Eriksen shapes to bend it… it’s curling—EDERSON DIVES—AND TIPS IT OVER! That ball was destined for the top corner!" },
      "96": { "type": "score", "team": "home", "scorer": "Højlund", "newScore": [1, 0], "text": "Corner United. Bruno again, urging the crowd to lift. He floats it near post—Casemiro meets it—GLANCING HEADER! Saved! Rebound loose! Højlund and Dias in a tussle—penalty shouts! Ref says play on! City clear desperately. Pep is furious, flapping like a kestrel on the touchline. City counter now. It’s end-to-end chaos. Grealish carries it 40 yards, skips past Eriksen—lays it inside to De Bruyne. De Bruyne threads it to Foden—he’s in behind! 1-on-1! FODEN SHOOTS—SAVED BY ONANA! Point-blank brilliance! A save for the archives! Onana punches the turf in passion. Tempers flaring. Casemiro and Rodri get into it after a crunching 50/50. Players swarm in. Shaw drags Casemiro away. The ref holds his whistle—no cards, just warnings. This match doesn’t deserve a red. It deserves a goal. City keep the pressure. Doku again—beats Dalot—chips to the far post! Walker climbs—heads it down to Silva—he shoots—DEFLECTED! It loops toward goal—VARANE CLEARS OFF THE LINE! Martinez boots it out of the box with veins full of adrenaline. This is football on a knife’s edge. Still time! United go long—Varane sprays it to Antony—flicks it inside for Bruno! Bruno turns! He finds Højlund—HE’S THROUGH—ONE TOUCH—LEFT FOOT—SHOOTS—GOOOOOOOOOAL!!! THE STADIUM ERUPTS!" },
      "97": { "type": "commentary", "text": "City kick off in desperation. They flood men forward. De Bruyne fires one last long ball—Varane heads clear. Another cross—Onana claims it with a lion’s leap. He drops to the ground, clutching it, eating up every second. The ref checks his watch." },
      "98": { "type": "commentary", "text": "FULL-TIME WHISTLE! IT’S OVER! MANCHESTER UNITED WIN THE DERBY!" },
      "99": { "type": "commentary", "text": "Final Score: Manchester United 1 – 0 Manchester City" },
      "100": { "type": "commentary", "text": "Onana: 10 saves, a wall. Man of the Match: Martínez or Onana? Toss-up. Old Trafford is shaking. The fans can barely believe what they’ve witnessed. 95 minutes of holding the line. Then one stroke of cold-blooded finishing. This wasn't just a derby. This was a war epic. A masterpiece." }
    }
  },
  "barcelona_vs_real_madrid": {
    "homeTeam": {
      "name": "Barcelona",
      "logo": "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg"
    },
    "awayTeam": {
      "name": "Real Madrid",
      "logo": "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg"
    },
    "events": {
      "0": {
        "type": "commentary",
        "text": "The stadium is thunderous! Flags wave like sea currents across a floodlit Camp Nou, packed to the brim with over 99,000 fans. Barcelona kick off from left to right in their iconic blaugrana, while Real Madrid, dressed in crisp white, are focused and statuesque in formation. Xavi is pacing nervously near the touchline; Ancelotti calmly chews gum with the nonchalance of a man who’s seen it all. The referee checks his watch... and we are LIVE! El Clásico has begun!"
      },
      "1": {
        "type": "commentary",
        "text": "Barcelona start with early possession. Christensen to Koundé, who looks up and lofts it toward João Cancelo on the left. He controls expertly with the outside of his boot and taps it into Gavi, who immediately turns under pressure from Camavinga. Gavi finds Pedri centrally—quick triangles forming. Madrid stay compact in a 4-4-2, with Bellingham pressing alongside Rodrygo. First tactical sparring, cautious but razor-sharp."
      },
      "2": {
        "type": "commentary",
        "text": "Real respond. Alaba to Mendy, who overlaps down the left and whips in a ball looking for Vinícius Jr, but Koundé reads it early and intercepts. Vinícius presses hard, forcing Koundé to clear hastily. Modrić collects the loose ball, dances past De Jong with a faint, and fires it across to Valverde on the right—Real stretch the pitch beautifully. This is what El Clásico is about: chess at 100mph."
      },
      "3": {
        "type": "commentary",
        "text": "Pressure from Real! Modrić plays it short to Bellingham, who drops deep, turns elegantly past Pedri, and floats a diagonal toward Rodrygo. Rodrygo chests it down, volleys into the box—but Ter Stegen is alert and gathers cleanly. Still no shots, but the tempo is ferocious. Barcelona looking for control; Madrid smelling blood with every transition."
      },
      "4": {
        "type": "commentary",
        "text": "Barcelona try to break. Cancelo, bold as ever, surges past Carvajal with a flick. He cuts inside, plays it centrally to Gavi, who swivels and releases a line-splitter to Lewandowski! He’s between Alaba and Rüdiger—takes a touch—shoots... BLOCKED! Rüdiger throws himself across like a wall of marble. The first roar of goal anticipation echoes—but Madrid survive."
      },
      "5": {
        "type": "commentary",
        "text": "Real Madrid come again. Valverde down the right, motors forward with that long stride, skips inside Balde and lays it off to Modrić, who fakes to shoot, then threads it into Bellingham at the edge of the D. One touch—he’s lining it up—GOES FOR GOAL! Just over! The ball brushes the top of the netting. Camp Nou exhales. The Englishman nearly struck first blood."
      },
      "6": {
        "type": "commentary",
        "text": "Barcelona regather and try to calm the storm. Ter Stegen plays short to Araújo. Calm as a glacier, he scans and pivots out of a light press from Vinícius Jr. He finds Koundé, who inverts centrally—Barça are inverting both fullbacks now! Cancelo and Balde are hugging touchlines while De Jong pulls the strings from deep. He drops between Christensen and Koundé—this is a classic Xavi control setup. Pedri receives between the lines—beautiful one-touch layoff to Gavi! Gavi surges into the final third—Lewandowski makes a diagonal run behind Rüdiger—Gavi threads it—but the pass is slightly overcooked. Courtois reads it and pounces on it like a panther. Still, lovely pattern from the home side. They’re starting to bite into the game’s rhythm."
      },
      "7": {
        "type": "commentary",
        "text": "Real Madrid reset with surgical calm. Modrić and Kroos—footballing aristocrats—exchange a quick triangle to beat Barça’s press. Kroos now with the ball—he scans—then delivers a vertical slicing ball between the lines—right into Bellingham’s stride! Bellingham turns, accelerates—Gavi chases but can’t catch him. He’s 25 yards out—feeds it to Vinícius on the left wing. Vini drops his shoulder—faints—cuts inside past Araújo—left footed curler! But Ter Stegen is equal to it! He dives right and punches it clear! The Camp Nou breathes a collective sigh—Vinícius almost lit the fuse."
      },
      "8": {
        "type": "commentary",
        "text": "Barcelona turn defence to attack with blinding pace. Balde collects the clearance and explodes up the left like a jet engine. Carvajal backpedals nervously. Gavi overlaps—Balde slips it to him—and Gavi with a stunning whipped ball across the face of goal—Raphinha arrives—volleys—OH IT SCRAPES THE POST! The far post rattles ever so slightly. So close! Courtois was motionless—he didn’t move an inch. Xavi claps furiously on the touchline, urging his team to keep going. We’ve got a classic on our hands!"
      },
      "9": {
        "type": "commentary",
        "text": "This is the kind of tempo that steals years off managers’ lives. Modrić again shows his genius—drops deep, draws two in, then threads a ball over the top—Vinícius is ON-SIDE! He races past Koundé—he’s in behind! Ter Stegen rushes out! Vinícius goes for the chip! OH MY WORD—JUST wide! He had the keeper beaten, but it skims the side netting! Vinícius can’t believe it—hands on head. Camp Nou roars to rally their side. Real Madrid nearly drew first blood again. We’re not even ten minutes in and it’s chaos—beautiful, orchestrated chaos."
      },
      "10": {
        "type": "commentary",
        "text": "Barcelona now lean into their positional play. De Jong takes control, dropping deep like a quarterback. He slides it to Christensen, who invites pressure before feeding Cancelo. Cancelo dribbles diagonally, slices inside Kroos—he opens his hips—what a pass to Raphinha through the channel! Raphinha chests it down and cuts into the box! Alaba meets him—Raphinha feints left, then right, hits the turbo—goes down! Huge shouts for a penalty!! Referee waves play on! VAR will surely have a look. The crowd is up in arms, baying for justice. Replay shows slight contact, but did Raphinha go down too easily? No VAR intervention… yet. And Real Madrid break the other way! Rodrygo accelerates, tearing down the right wing. He squares for Benzema—his first real touch in the final third—he spins, tries to play in Bellingham—but Araújo reads it and steps across with impeccable timing. What a player! The stadium chants his name like a war drum."
      },
      "11": {
        "type": "commentary",
        "text": "Still buzzing from that penalty shout, Barcelona slow it down to recalibrate. De Jong drops into the left half-space. He’s conducting the tempo like a maestro now—short pass to Gavi, back to De Jong, out to Koundé. Koundé lofts a switch diagonally across the pitch—Cancelo cushions it exquisitely on the run with his chest—he’s 1v1 with Carvajal—drops a shoulder—inside! Low shot near post! Saved by Courtois! Strong wrists from the Belgian. Real Madrid survive again."
      },
      "12": {
        "type": "commentary",
        "text": "Real Madrid probe carefully. Kroos delays—waits—and pierces a pass through the press to Modrić. The Croatian pivots like a ballet dancer, then flips a ball down the inside-left channel for Vinícius Jr. Again, Vinícius vs Araújo. What a duel this is. Vinícius tries a stepover… two… cuts in—Araújo sticks a toe in—clean! Brilliant tackle! Araújo turns defence into attack instantly. Off he goes charging upfield! Crowd absolutely erupts! He releases it wide to Raphinha—Barcelona counter! Raphinha finds Lewandowski at the top of the box—back to goal—he tries a backheel flick to Gavi arriving… intercepted by Alaba at full stretch. Electrifying football."
      },
      "13": {
        "type": "commentary",
        "text": "Barcelona turn the screw. Pedri and Gavi are now combining like gears in a watch. They run rings around Modrić and Camavinga. Gavi now goes on a slaloming run down the left—beats one—two—enters the box—cutback across goal!! No takers! The ball trickles agonizingly across the face of goal. Lewandowski was a half-step too late. Real Madrid breathe again. Xavi claps furiously. He knows a goal is coming if this continues."
      },
      "14": {
        "type": "commentary",
        "text": "Free kick Real Madrid—about 35 yards out. Kroos stands over it. He chips it toward the far post—Bellingham rises like a skyscraper—HEADS IT DOWN—Saved!! Ter Stegen gets down quickly and clutches it! Big save! Barcelona fans whistle in appreciation of their keeper. Bellingham is proving to be a nightmare in those late runs into the box. He’s everywhere."
      },
      "15": {
        "type": "score",
        "team": "home",
        "scorer": "Lewandowski",
        "newScore": [
          1,
          0
        ],
        "text": "GOOOOOOAAAAAAAL!!! BARCELONA 1–0 REAL MADRID!!! It’s LEWANDOWSKI!!! The Camp Nou ERUPTS into a frenzy!! Pedri starts it all. He glides past Camavinga in midfield—elegant as ever—and slides a dagger ball into Lewandowski at the edge of the D. He turns ALABA inside out with one move and rifles it low into the bottom-left corner! Courtois is beaten! Pure instinct. Pure class. Xavi leaps into the air on the sideline—fists pumping! The crowd is a wall of sound! That was clinical. El Clásico has its first goal!"
      },
      "16": {
        "type": "commentary",
        "text": "Real Madrid try to respond. Modrić, Valverde, and Kroos form a triangle—tempo picks up. They’re pushing high now. Valverde threads it through to Rodrygo—good first touch—he’s in the box! SHOOTS—BLOCKED by Christensen! Sacrifices his body! Corner Madrid. Kroos jogs over. Near-post delivery—cleared by De Jong—but only as far as Modrić—volley on the bounce—WIDE! Just inches wide. That was hit with venom."
      },
      "17": {
        "type": "commentary",
        "text": "Barcelona drop slightly, looking to lure Madrid forward. Ter Stegen plays short to Koundé. Madrid press in numbers—Rodrygo and Vini press high—but Barça work their way out with a gorgeous 8-pass sequence. Cancelo bursts into midfield, skips past Camavinga, and releases Balde. Balde tears down the left. Cross comes in—headed away by Rüdiger—but only as far as Pedri—he volleys it FIRST TIME—blocked again! It’s end-to-end, breathtaking football."
      },
      "18": {
        "type": "commentary",
        "text": "Vinícius Jr gets a yellow! Oh it’s boiling now! He lunges in hard on Araújo near the sideline. Studs up—not malicious, but late. The crowd lets him hear it. Araújo gets up quickly though, composed as ever. Referee lays down the law. That’s the first booking of the night—and it had been coming. Tempers starting to rise."
      },
      "19": {
        "type": "commentary",
        "text": "Barcelona holding onto the ball now—De Jong orchestrating from deep, with Pedri and Gavi interchanging positions constantly. Raphinha has come slightly inside, operating in the half-space—he receives from Cancelo and turns—he’s got Lewandowski peeling wide! Raphinha plays a curling ball toward the far post—Lewandowski meets it with a diving header! JUST WIDE! Inches! Courtois was rooted. Lewa looks up, frustrated. That could’ve been his brace."
      },
      "20": {
        "type": "commentary",
        "text": "Free kick for Barcelona—35 yards out, left of center. Pedri stands over it. He lifts it toward the penalty spot—Araújo rises—beaten in the air by Rüdiger. But it falls to Gavi outside the box—he strikes it low! DEFLECTED! Corner Barcelona! The stadium is whistling with anticipation now. Every attack feels like it could be a goal. The volume is deafening."
      },
      "21": {
        "type": "commentary",
        "text": "Barcelona corner—Raphinha swings it in—Lewandowski goes for it—misses—but the ball falls to Christensen at the back post! Hooks it back across goal—cleared by Alaba on the line!! Unbelievable! Madrid hanging on. Ancelotti is barking instructions now, demanding shape and composure."
      },
      "22": {
        "type": "commentary",
        "text": "Sudden counterattack! Vinícius Jr sprints down the left after a sharp ball from Kroos. He’s isolated with Koundé—cuts inside—plays in Bellingham on the overlap—shot across goal—Ter Stegen gets a fingertip to it! Corner! The white shirts surge forward. Kroos swings it in—Alaba heads—just over! Ter Stegen stretches but watches it fly over the bar."
      },
      "23": {
        "type": "commentary",
        "text": "Barcelona survive and control returns. Pedri receives between the lines again—brilliant vision—he plays a blind reverse ball through for Raphinha—OH what a pass! Raphinha’s first touch takes him wide—he drills it across goal… cut out by Courtois at full stretch! End-to-end. Tactically intricate. Emotionally wild. It’s everything a Clásico should be."
      },
      "24": {
        "type": "commentary",
        "text": "Free kick Real Madrid—Camavinga fouled by Pedri. Kroos floats it high into the box—Rüdiger heads it back across—Rodrygo tries the overhead kick! Spectacular effort—but it loops just over the bar! Ter Stegen was stranded! Oooohs ripple through the crowd. That was nearly one for the ages."
      },
      "25": {
        "type": "commentary",
        "text": "Barcelona slow it down. Frenkie De Jong plays a wonderful disguised pass out wide to Cancelo. The fullback drives infield, skips past Kroos, and lays it off to Gavi. Gavi tries a quick one-two with Lewandowski—intercepted by Alaba. But the second ball drops to Pedri again—quick shot—deflected! Courtois scrambles but it goes just wide for another corner. The home side is relentless."
      },
      "26": {
        "type": "score",
        "team": "home",
        "scorer": "Gavi",
        "newScore": [
          2,
          0
        ],
        "text": "GOOOOOAL! 2–0 BARCELONA!!! IT’S GAVI! From the corner! Raphinha curls it deep—Araújo knocks it back across goal—Gavi arrives late, unmarked—and volleys it past Courtois from 7 yards! The stadium goes MAD! Gavi wheels away, arms outstretched, veins bursting with passion! Xavi is losing it on the sideline—hugging staff—roaring to the heavens! What a moment for the young Spaniard! It’s 2–0 to Barça and Real Madrid are shell-shocked!"
      },
      "27": {
        "type": "commentary",
        "text": "Real Madrid are rattled. Ancelotti calls Rodrygo and Valverde over—clear tactical tweaks incoming. Vinícius tries to make something happen—he receives on the left—drives at Koundé—dances, jinks, goes left—shoots low—Ter Stegen saves again! He’s been unbeatable tonight."
      },
      "28": {
        "type": "commentary",
        "text": "Barcelona now smell blood. Pedri dances through midfield like a ghost. He nutmegs Camavinga—OLÉÉÉÉÉ echoes across Camp Nou! He then releases Balde down the wing. The fullback whips it low across the six-yard box—just evades Lewandowski! So close to a third."
      },
      "29": {
        "type": "commentary",
        "text": "Modrić tries to lift Madrid. He drops deep, demands the ball, and accelerates. He sends it out to Rodrygo on the right. Rodrygo drives, cuts in, fires one—deflected! Corner Madrid. Kroos to take again. It’s a short routine—Modrić crosses—Rüdiger attacks it—header!! Saved by Ter Stegen again! He’s a wall!"
      },
      "30": {
        "type": "commentary",
        "text": "Half an hour gone. It’s been a whirlwind. Barcelona lead 2–0. They’ve been dominant in midfield, ruthless in the final third, and heroic at the back. But this is Real Madrid—they’ve come back from worse. Ancelotti looks deep in thought. Substitutions warming. Tactical recalibration is imminent."
      },
      "31": {
        "type": "commentary",
        "text": "The tempo hasn’t dropped an inch. Pedri receives a slick diagonal from Koundé and glides between Valverde and Kroos with such fluidity it draws gasps from the crowd. He slips a quick one-two with Gündoğan, who’s popped up in the left channel—Gundo drags Carvajal out of shape, and it opens space centrally. Lewandowski drops deep to collect, flicks it behind his standing leg—brilliant flair—but Nacho reads it and clears with urgency. It’s football with the brakes off."
      },
      "32": {
        "type": "commentary",
        "text": "Real Madrid now trying to regain composure. Tchouaméni, calm as ever, turns under pressure from Félix and spreads it to Mendy. Mendy surges forward—outpaces Araújo momentarily—but just as he’s about to release it, Koundé tracks back and intercepts. Crucial intervention. Barça fans chant his name from the rafters—KOUN-DÉ! KOUN-DÉ! It’s electric."
      },
      "33": {
        "type": "commentary",
        "text": "Barça back on the prowl. De Jong is now dictating from deep, orchestrating with his head constantly swiveling. He sees Gavi’s diagonal run into the right half-space and picks him out with a slicing ball. Gavi controls with one foot, drags with the other, and leaves Camavinga in his wake! Cross into the six-yard box—Lewandowski rises! But Lunin punches clear, brave keeping from the Ukrainian!"
      },
      "34": {
        "type": "commentary",
        "text": "The rebound falls to Balde, 30 yards from goal. He has options, but no—he goes for it! A thunderous left-footed volley! It dips viciously and Lunin has to parry it again! Real Madrid hanging on for dear life right now. Barça smell blood, and Camp Nou is at full volume."
      },
      "35": {
        "type": "commentary",
        "text": "Real attempt to slow the momentum. Kroos and Modrić work the ball between themselves, Modrić using that trademark turn to shake off Gavi. He drives forward now—still has that burst of acceleration—and plays a reverse ball to Vinícius Jr. Vini’s in behind Koundé! The flag stays down—1v1—SHOOTS! Ter Stegen saves with his leg! MASSIVE moment! Offside goes up late—but still—what a save."
      },
      "36": {
        "type": "commentary",
        "text": "That scare jolts Barça back into rhythm. Gündoğan links with Pedri again—those two are like jazz musicians riffing in real-time. Quick exchanges, one-touch stuff, until Gündoğan flicks it over the top! Félix chases—volleys it first-time across goal—but Lewandowski can’t get the final touch. Inches away from a goal of the season contender!"
      },
      "37": {
        "type": "commentary",
        "text": "Now it's end-to-end. Valverde picks up the pieces for Madrid and drives through midfield like a freight train. He ignores the crowd noise and cuts it square to Rodrygo. Rodrygo opens his body—goes for the curler! Just over! Ter Stegen was at full stretch but always had his eye on it."
      },
      "38": {
        "type": "commentary",
        "text": "Tension now turning into intensity. Fouls creeping in. Gavi and Camavinga clash in midfield—Gavi leaves a little something in there—Camavinga retaliates. Players swarm. Ref steps in quickly, diffuses it. No cards, but the warning is loud and clear. This is El Clásico, and the needle is always sharp."
      },
      "39": {
        "type": "commentary",
        "text": "Barça free kick. Around 35 yards out. Gündoğan stands over it, arms outstretched like a conductor. He floats it to the far post—Lewandowski peels off Nacho—heads it back across goal! Gavi dives in! But Lunin gathers just before Gavi can connect. Courage from the keeper again. What a performance he’s putting on."
      },
      "40": {
        "type": "commentary",
        "text": "Real Madrid try the direct route now. Tchouaméni floats a 40-yard ball over the top for Vini Jr., who chests it perfectly and blazes past Araújo! But the angle’s tight—he cuts it back—and no one’s there again! Valverde was late to arrive. Another golden chance goes begging for Los Blancos."
      },
      "41": {
        "type": "commentary",
        "text": "Pedri wins it back. This kid is silk and steel combined. He slows the game with delicate touches, then suddenly drives past Modrić with a drop of the shoulder. He lays it to Lewandowski who—wait—heel-flicks it to Gavi! One-touch pass to Félix—he’s in! Low shot—SAVED! Unbelievable sequence. Barça are dancing in triangles!"
      },
      "42": {
        "type": "commentary",
        "text": "Corner for Barça. Gündoğan takes. It’s a low-driven effort—deception! Gavi meets it at the near post—glances it! JUST wide! It was a clever routine straight from the training ground. The Real defence didn’t react in time."
      },
      "43": {
        "type": "commentary",
        "text": "Modrić takes command again. Little pirouette, and then picks out Carvajal making a blindside run. Cross into the box—Rodrygo attacks it—but Araújo slides in, heroic block! Real appeal for a foul—nothing doing. Araújo gets up roaring like a lion!"
      },
      "44": {
        "type": "commentary",
        "text": "Tchouaméni is trying to stamp his authority, breaking up play and starting transitions. But every time he does, De Jong or Pedri are there to counter-press. It’s like watching synchronized swimming—Barça always seem to have a spare man."
      },
      "45": {
        "type": "commentary",
        "text": "Approaching the break. Gündoğan makes one more surge—sidesteps Modrić, nutmegs Kroos—passes to Félix on the edge of the box—he tries a no-look shot! Deflected! Over the bar! The Camp Nou crowd rises in unison—Sí se puede! they chant. Two added minutes. Barça continue to probe. Balde sprints down the flank, gets past Carvajal, delivers early to Lewandowski! He shoots—LUNIN SAVES AGAIN! He is having the game of his life! And there’s the halftime whistle! A breathless first half ends 0–0, but don’t let the scoreline fool you—this has been a heavyweight brawl disguised as a ballet. Lunin and Ter Stegen both exceptional. Barça slightly edging possession and chances. Real dangerous in transition. Second half promises fireworks."
      },
      "46": {
        "type": "commentary",
        "text": "And we’re back under the Catalan skies! Barça instantly on the front foot. Gündoğan drifts wide to overload the left with Balde. Quick one-two—they drag Carvajal and Valverde out, and now Gavi darts into the vacated half-space. Gündoğan plays it into him—Gavi squares across the box—Lewandowski! SHOOTS! Blocked by Nacho! It pinballs back to Félix—tries a rabona cross—headed away! Real Madrid survive by inches, again!"
      },
      "47": {
        "type": "commentary",
        "text": "Real Madrid respond with a fluid phase. Modrić drops deep beside Tchouaméni—Kroos drifts out wide left to form a diamond. Suddenly Rodrygo tucks inside and it’s Vinícius wide. The ball zips from Kroos to Modrić to Valverde—he clips it over the top for Vini Jr.! He’s in behind—low cross to Rodrygo! MISS-HIT! Right into Ter Stegen’s gloves! The execution just didn’t match the build-up."
      },
      "48": {
        "type": "commentary",
        "text": "Pedri, like a puppeteer, keeps Barça ticking. He feints right, goes left, shrugs off Camavinga. The whole stadium oohs. He picks out a beautiful vertical line-breaking pass straight into Félix between the lines. Félix drops deep, drags Rüdiger out, and that opens a diagonal to Lewandowski—he turns! SHOOTS! Lunin AGAIN!! Stretches low to his right! Barça can’t believe this keeper!"
      },
      "49": {
        "type": "commentary",
        "text": "Set-piece Barcelona. Gündoğan over the corner again—right-footed inswinger to the back post. Araújo out-jumps everyone! It’s looping! CLEARED OFF THE LINE BY KROOS! Extraordinary defensive awareness! The German is calm as ever, just nodding it away under pressure."
      },
      "50": {
        "type": "commentary",
        "text": "Tempers beginning to simmer. Félix gets clipped by Tchouaméni in the middle—ref waves advantage. Gavi storms in, puts a crunching challenge on Modrić. Now Madrid are protesting. Vinícius runs over, finger-pointing. Gavi barks back. The referee, cool under pressure, calls both over. Just a stern warning this time, but it’s boiling."
      },
      "51": {
        "type": "commentary",
        "text": "Free kick Madrid. 35 yards out—Kroos floats it into the corridor of uncertainty. Rüdiger attacks it with menace—header! Inches over the crossbar! Ter Stegen was rooted. You could hear the net ripple in the fans’ imagination."
      },
      "52": {
        "type": "commentary",
        "text": "Barça slow it down. De Jong orchestrating from deep again. He steps between the centre-backs in that Busquets role. Real hesitate—Gavi sprints between lines. De Jong finds him. Touch—pass to Pedri—first-time scoop to Balde! Cross from the byline—Félix with a diving header! SIDE-NETTING! Half the crowd thought it was in!"
      },
      "53": {
        "type": "commentary",
        "text": "Substitution incoming for Real Madrid. Camavinga comes off—looked a bit leggy—and in comes Jude Bellingham to a wave of boos from the home crowd and applause from traveling fans. That changes the midfield dynamic entirely."
      },
      "54": {
        "type": "commentary",
        "text": "Bellingham makes his presence known immediately. Drops deep to receive from Kroos, shields from Gavi, swivels, and then drives forward. He skips past Pedri and plays a perfectly timed ball to Vinícius on the edge of the area. Vini chops inside Araújo—GOES NEAR POST! Ter Stegen, hand of steel! Parried away. Bellingham applauds him—Vini’s confidence is soaring."
      },
      "55": {
        "type": "commentary",
        "text": "Still no breakthrough but you can feel it coming. Every touch is electric. Gavi breaks the lines again, dances past Bellingham—yes, past Bellingham—and plays in Félix. He holds it up, waits for support, flicks it to Gündoğan who arrives late—CRACKS IT! OFF THE CROSSBAR!! The woodwork is trembling! Lunin was beaten! Inches away from the opener!"
      },
      "56": {
        "type": "commentary",
        "text": "Crowd now firmly the twelfth man. Camp Nou is a cauldron of chants, bouncing up and down in unity. Barça are feeding off it. Balde pushes forward again. One-two with Gavi—slides across goal—Lewandowski tries the flick! BLOCKED! Rebound to Pedri! LASER SHOT! Saved by Lunin! He’s in god mode!"
      },
      "57": {
        "type": "commentary",
        "text": "Modrić turns into space, Real shift gears again. Bellingham picks up the second ball and glides forward like he’s on ice skates. Plays a give-and-go with Valverde, makes it to the edge of the D—shoots with power! But Ter Stegen reads it, dives low, holds. End-to-end doesn’t even begin to describe this."
      },
      "58": {
        "type": "commentary",
        "text": "Barça now add muscle to midfield. Sub incoming—Ferran Torres comes on for Félix. Fresh legs out wide, more pressing intensity. Xavi looks animated, barking tactical adjustments. Ferran instantly presses Rüdiger into a long ball and Barça regain possession high. The crowd rewards that hustle with thunderous applause."
      },
      "59": {
        "type": "commentary",
        "text": "Pedri finds Ferran on the right touchline—1v1 with Mendy—he feints, chops inside, curls one toward the back post—LEWANDOWSKI IS THERE! But so is Nacho! What a duel! Nacho stretches every ligament to nick it away for a corner. He screams and pumps his fist. He knows how vital that interception was."
      },
      "60": {
        "type": "commentary",
        "text": "Corner Barça. Gündoğan whips it—Araújo meets it FULL HEAD! Cleared off the line AGAIN by Valverde! That’s twice Madrid have denied goals by millimeters. Barça fans are in disbelief. Real Madrid fans are on edge. We’ve reached the hour mark and it’s STILL 0-0—somehow. But what a battle, what a match."
      },
      "61": {
        "type": "commentary",
        "text": "Barcelona pressing high again! Lewandowski sprints to close down Courtois—forces a hurried clearance! It drops near midfield—Gavi wins the aerial duel against Modrić! That’s hunger! He pokes it forward—João Félix is on it! Twists past Nacho with a burst! Into the box—lays it to Lewandowski—first-time hit! BLOCKED by Rüdiger! That’s a goal-saving block! Ball ricochets high—De Jong goes up for it—but Tchouaméni heads clear under pressure! The rhythm won’t let up!"
      },
      "62": {
        "type": "commentary",
        "text": "Real Madrid now slow the tempo, trying to breathe. Kroos directs traffic, pointing where he wants the run. He plays it short to Camavinga—Camavinga drives into space like a silent bullet—beats Gündoğan with a drop of the shoulder! Slips it wide to Valverde—who crosses early! Vini Jr is there! Tries to volley it! But Koundé leans into him just enough—Vini slices it wide! And he’s screaming for a penalty—referee unmoved!"
      },
      "63": {
        "type": "commentary",
        "text": "Xavi is animated—gesturing for Gavi to tuck inside when Madrid have the ball. Tactical adjustment—Barcelona transitioning into a narrow 4-2-2-2 when pressing. It’s working! Gavi and Gündoğan squeeze Modrić into a mistake! Turnover! Quick pass to Pedri—he’s galloping forward—slots it to Lewandowski at the edge—lays it off to Félix! Shoots! Straight into Courtois’ chest! But the build-up was electric!"
      },
      "64": {
        "type": "commentary",
        "text": "Real regain possession, this time building methodically. Kroos to Modrić—Madrid rotate the triangle—Carvajal overlaps—Modrić feeds him—Carvajal low cross into the six-yard box—Vini Jr slides! Ter Stegen parries! Chaos! Ball spills loose! Valverde THUMPS IT! BLOCKED BY ARAUJO ON THE LINE! OH MY WORD! That’s commitment! Ter Stegen gets up roaring with gratitude!"
      },
      "65": {
        "type": "commentary",
        "text": "The tension is crackling now. Foul by Gavi on Camavinga near the halfway line—quick free kick taken—Madrid go direct! Rüdiger launches one over the top for Rodrygo—he’s in a footrace with Balde! Rodrygo edges ahead—gets the touch! Into the box! Ter Stegen rushes out! Rodrygo tries to chip him—Ter Stegen SAVES with his shoulder! Outstanding! That could’ve been the moment!"
      },
      "66": {
        "type": "commentary",
        "text": "Barcelona push back. Araujo pings a laser to Pedri who controls it with a magnetic touch. He turns—spots the overlapping Balde—feeds him perfectly down the left wing. Balde whips it early—Félix dummies—Gavi arrives late—SHOT! GRAZES THE POST! The Camp Nou groans! So, so close!"
      },
      "67": {
        "type": "commentary",
        "text": "Substitution for Real Madrid: Modrić comes off to raucous applause from the away end. In comes Jude Bellingham, fresh and dangerous. An immediate buzz. You just feel like he’s going to be decisive. Xavi calls Ferran Torres over—he’s getting ready too. It’s a chess match now."
      },
      "68": {
        "type": "commentary",
        "text": "Bellingham already asserting himself. First touch—takes it on the turn—flicks it behind De Jong—oh that’s smooth! Drives forward! Lays it to Rodrygo who cuts inside on his left—curler! Just wide! But Real Madrid fans erupt at Bellingham’s composure. What an introduction!"
      },
      "69": {
        "type": "commentary",
        "text": "Barcelona counter directly! From the goal kick—Pedri flicks it to Félix, he’s drifting inside more now—plays a sublime diagonal to Lewandowski—he chests it down between the center-backs! On his left! SHOOTS—Courtois SAVES low with one hand! That’s elite goalkeeping under pressure!"
      },
      "70": {
        "type": "commentary",
        "text": "Seventy minutes in and we are still goalless, but it’s a miracle! It’s been a masterclass in defending, pressing, shot-stopping—every player is drenched in sweat, giving everything. The managers look like they’ve aged five years. This is El Clásico warfare—without the goals, but with every other ingredient turned to eleven."
      },
      "71": {
        "type": "commentary",
        "text": "Real Madrid with a long spell of possession now—Bellingham, Kroos, and Tchouaméni are rotating in elegant symmetry. Barcelona sit deep—a rare low block. Vini Jr dances at the edge—tries a one-two with Camavinga—it comes off! Vini Jr shoots from a tight angle—into the side netting! Half the stadium thought it was in!"
      },
      "72": {
        "type": "commentary",
        "text": "Barcelona substitutions: Ferran Torres replaces João Félix; Oriol Romeu comes on for Gavi. Xavi adding fresh legs, more stability. He’s shuffling the midfield lines—De Jong sits deeper, allowing Pedri to roam closer to Lewandowski. New shape, new spark?"
      },
      "73": {
        "type": "commentary",
        "text": "Barcelona recycle possession now—Romeu anchoring, plays it to De Jong, who splits the press with a disguised pass to Pedri. Pedri! Flicks it behind Nacho! Ferran Torres is through! One-on-one! SHOOTS—OFF THE POST! Oh my word! Inches! The net was ready to ripple!"
      },
      "74": {
        "type": "commentary",
        "text": "Real counter at breakneck pace. Vini Jr, now hugging the left touchline, receives from Valverde—dribbles inside—past two—feeds Bellingham at the arc—he lets it roll across his body—curls it! OH JUST OVER! The net bulged... from the wind! Unreal technique!"
      },
      "75": {
        "type": "commentary",
        "text": "Fifteen minutes left. The tension is unbearable. Every pass, every dribble, every tackle feels like a moment of destiny. The benches are up, fans biting nails, flags waving violently in the Catalan breeze. Neither side blinking. It’s a matter of will now."
      },
      "76": {
        "type": "commentary",
        "text": "Real Madrid building with surgical patience again. Tchouaméni steps into midfield like a conductor—slides it to Carvajal who’s got space—early ball across—deflected! Bellingham arrives! Swipes it! Ter Stegen saves again! And screams at his defense! That’s his seventh save tonight. He’s been a wall!"
      },
      "77": {
        "type": "commentary",
        "text": "Barcelona regain some rhythm. De Jong finds Balde again—deep cross this time—Lewandowski rises! Header! Saved AGAIN by Courtois! But the flag goes up late—offside. Still, the quality of delivery and timing is giving Madrid headaches."
      },
      "78": {
        "type": "commentary",
        "text": "Koundé intercepts a through ball and surges forward like a steam train—beats two—passes to Torres—Torres flicks it beautifully to Pedri—he’s at the edge! SHOOTS—BLOCKED by Rüdiger—falls to Lewandowski! Tries the overhead kick—JUST OVER! Daring! Camp Nou explodes in appreciation."
      },
      "79": {
        "type": "commentary",
        "text": "Corner to Barça—Pedri to take it—outswinger—Araujo towers over everyone—heads it! Cleared off the line by Tchouaméni! That was in! No VAR call yet—it might have just stayed out! Every inch is being contested like a final!"
      },
      "80": {
        "type": "commentary",
        "text": "Real Madrid on the counter! Rodrygo sprints 50 yards after a lofted Kroos pass—he’s isolated against Balde—chops inside—goes down! Referee says NO PENALTY! And it’s mayhem! Madrid bench is furious! Replay shows minimal contact—was it enough? It’s El Clásico—controversy is tradition!"
      },
      "81": {
        "type": "commentary",
        "text": "The game is at fever pitch now. Barça are throwing everything forward. Araújo steps into midfield—an auxiliary midfielder now. De Jong orchestrates from deep—finds Gündoğan, who threads an inch-perfect ball to Balde darting behind Carvajal! Balde’s touch is exquisite—cuts it back to Lewandowski! STRIKES—DEFLECTED—SCREAMS WIDE! Corner! Lunin was rooted! That deflection from Nacho possibly saved a goal!"
      },
      "82": {
        "type": "commentary",
        "text": "Corner Barcelona. Camp Nou is a wall of noise. Gündoğan raises one hand—signals the set play. Outswinger… flicked on by Ferran at the near post—PEDRI ARRIVES! BANG! BLOCKED BY BELLINGHAM! What a defensive intervention! Jude throws his whole body on the line. Madrid fans erupt in appreciation!"
      },
      "83": {
        "type": "commentary",
        "text": "Real Madrid with rare breathing space now. Modrić slows it down, keeps possession under Barça’s suffocating press. Bellingham drifts left, linking up with Vinícius—he holds Araújo off—nutmegs him! Oh, the audacity! He’s galloping forward into the box—cuts onto his right—shoots… TER STEGEN SAVES! Glorious solo run by Vini Jr.!"
      },
      "84": {
        "type": "commentary",
        "text": "Barça counter with velocity. Gavi snatches the loose ball, explodes forward, shrugging off Valverde. He spreads it wide—Ferran Torres races down the right—low cross across the box—NO ONE THERE! Just too far for Lewandowski. Gündoğan chases but Real regain. Inches separating agony and ecstasy."
      },
      "85": {
        "type": "commentary",
        "text": "SUBSTITUTION BARCELONA: Sergi Roberto comes on for Gavi—who gets a standing ovation for a warrior’s shift. Xavi opting for fresh legs and perhaps some control. Gavi taps the crest as he walks off, mouthing ‘Let’s go’ to the fans. He knows this is far from done."
      },
      "86": {
        "type": "commentary",
        "text": "Barça push higher. It’s wave after wave. De Jong with a sharp diagonal—Ferran heads it down—Pedri, in the pocket, opens his body and curls it toward the top corner! IT’S DIPPING—WHAT A SAVE FROM LUNIN! Full stretch to his left! That’s world-class! This man is singlehandedly holding Madrid together!"
      },
      "87": {
        "type": "commentary",
        "text": "Madrid clear and break! Vinícius again—a blur on the left—cuts infield. Araújo commits—misses! Vini’s through! 2v1 with Rodrygo—Vini to Rodrygo—back to Vini! DUMMIES TER STEGEN! OPEN GOAL—BLOCKED BY KOUNDÉ!! ABSOLUTE HEROICS! Koundé saves Barcelona from catastrophe! Camp Nou collectively exhales."
      },
      "88": {
        "type": "commentary",
        "text": "The clock is ticking, but there’s no let-up. Lewandowski drops deep, flicks one to Pedri—Pedri dinks it over the top—Balde on the left—drives to the byline—crosses—FERRAN HEADER!! JUST OVER THE BAR! He holds his head. He knows that could’ve been it. The margin is microscopic."
      },
      "89": {
        "type": "commentary",
        "text": "SUBSTITUTION MADRID: Modrić off, Dani Ceballos on. Modrić is applauded even by a few Barça fans—such is the respect. An absolute general tonight. Madrid now tightening midfield, trying to see this out or strike on the break."
      },
      "90": {
        "type": "commentary",
        "text": "Six minutes added on! SIX! And deservedly so—it’s been a maelstrom of action. The intensity has not dropped for a second. Xavi’s on the edge of his technical area, gesturing frantically. Ancelotti, arms folded, whispering to Ceballos as he presses high."
      },
      "91": {
        "type": "commentary",
        "text": "Barça attack again. Sergi Roberto slides into the channel—he’s in behind Mendy—low cross—DEFLECTED—loops high—Lewandowski meets it with a bicycle kick! OHHHHH! JUST OVER! He tried the spectacular! And it wasn’t far away. Lewandowski has the audacity, even in the 91st minute."
      },
      "92": {
        "type": "commentary",
        "text": "Madrid try to kill the game with possession. Kroos slows it down—passes back to Rüdiger—long ball to Rodrygo—chests it down—Koundé nips in! Clean! Now it’s end-to-end again. De Jong bursts forward—draws three Madrid players—slides it left to Pedri. Pedri to Ferran—CUT INSIDE—shoots—NACHO BLOCKS! Throws himself like a missile!"
      },
      "93": {
        "type": "commentary",
        "text": "Back come Madrid! Vinícius wide left, skips past Sergi Roberto, lays it to Bellingham at the edge of the D. Jude takes a breath, shifts, SHOOTS—DEVIATED! CORNER! Ter Stegen had dived the wrong way, but the deflection off Christensen took it wide! Real’s bench thought that was in!"
      }
    }
  }
};

    /**
     * Shows a temporary notification that auto-hides after a specified duration
     * @param {HTMLElement} element - The notification element to show
     * @param {string} text - The text to display
     * @param {number} duration - Duration in milliseconds (default: 4000ms)
     * @param {number|null} timeoutId - Current timeout ID to clear if exists
     * @returns {number} New timeout ID
     */
    // 1. Fix the showTemporaryNotification function (around line 100):
    function showTemporaryNotification(element, text, duration = 4000, timeoutId = null) {
        // Clear existing timeout if any
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        
        // Update text - fix the selector
        const textElement = element.querySelector('.notification-text') || element.querySelector('#foul-text') || element.querySelector('#corner-text');
        if (textElement) {
            textElement.textContent = text;
        }
        
        element.style.display = 'flex';
        
        // Set timeout to hide the element
        return setTimeout(() => {
            element.style.display = 'none';
        }, duration);
    };

    let currentMinute = 0;
    let gameInterval = null;
    let commentaryBuffer = [];
    
    // Timeout IDs for hiding temporary notifications
    let foulTimeout = null;
    let cornerTimeout = null;

    /**
     * Sends commentary to the backend for classification and logging.
     * This is a "fire and forget" call; the UI does not depend on the response.
     * @param {string} text - The commentary text.
     */
    function logCommentaryToBackend(text) {
        console.log('Sending to backend:', text); // Debug log
        fetch(FLASK_LOG_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        })
        .then(response => {
            if (response.ok) {
                console.log('Successfully sent to backend');
            } else {
                console.log('Backend responded with error:', response.status);
            }
        })
        .catch(error => {
            // Log error to the browser console, but don't show it in the UI
            console.error("Could not log commentary to backend:", error);
        });
    }

    /**
     * Calls the Gemini API directly to summarize text.
     * @param {string} commentaryText - The combined text to summarize.
     * @returns {Promise<string>} The generated snippet.
     */
    async function summarizeWithGemini(commentaryText) {
        // Check if API key is provided and valid
        if (!GEMINI_API_KEY || GEMINI_API_KEY === '' || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
            console.warn('Gemini API key not provided');
            return "Please add your Gemini API key to popup.js to enable AI summaries";
        }

        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;
        
        const prompt = `You are a football analyst. Summarize these key events from the last few minutes into one exciting sentence (max 20 words): "${commentaryText}"`;
        
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 50
            }
        };

        try {
            console.log('Calling Gemini API...'); // Debug log
            
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Gemini response status:', response.status); // Debug log

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Gemini API Error Response:', errorText);
                throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('Gemini API Response:', data); // Debug log
            
            const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            
            if (!generatedText) {
                console.error('No text generated from Gemini API');
                return "Unable to generate summary";
            }

            return generatedText;

        } catch (error) {
            console.error("Error summarizing commentary with Gemini:", error);
            
            // Provide more specific error messages
            if (error.message.includes('API_KEY_INVALID')) {
                return "Invalid Gemini API key. Please check your key.";
            } else if (error.message.includes('PERMISSION_DENIED')) {
                return "Permission denied. Check your Gemini API key permissions.";
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                return "Network error. Check your internet connection.";
            } else {
                return "Error connecting to AI service. Check console for details.";
            }
        }
    }

    function startMatchSimulation(matchId) {
        const matchData = MATCH_DATA[matchId];
        if (!matchData) {
            console.error('No match data found for:', matchId);
            return;
        }

        // Reset state
        currentMinute = 0;
        commentaryBuffer = [];
        team1ScoreEl.textContent = '0';
        team2ScoreEl.textContent = '0';
        rawCommentaryTextEl.textContent = 'Waiting for kick-off.';
        snippetTextEl.textContent = 'The match is about to begin...';
        scorerInfoEl.style.display = 'none';
        foulInfoEl.style.display = 'none';
        cornerInfoEl.style.display = 'none';
        
        // Clear any existing timeouts
        if (foulTimeout) clearTimeout(foulTimeout);
        if (cornerTimeout) clearTimeout(cornerTimeout);
        foulTimeout = null;
        cornerTimeout = null;
        document.getElementById('live-indicator').style.display = 'flex';
        team1NameEl.textContent = matchData.homeTeam.name;
        team1LogoEl.src = matchData.homeTeam.logo;
        team2NameEl.textContent = matchData.awayTeam.name;
        team2LogoEl.src = matchData.awayTeam.logo;

        toggleView(true);

        const runSimulation = async () => {
            currentMinute++;
            matchTimeEl.textContent = `${currentMinute}'`;
            const maxMinute = Math.max(...Object.keys(matchData.events).map(Number));
            const isLastEvent = currentMinute >= maxMinute;

            if (matchData.events[currentMinute]) {
    const event = matchData.events[currentMinute];
    rawCommentaryTextEl.textContent = event.text;

    // Send to backend for logging (fire and forget)
    logCommentaryToBackend(event.text);
    
    // Add all commentary to the buffer for summarization
    commentaryBuffer.push(event.text);

    if (event.type === 'score') {
        team1ScoreEl.textContent = event.newScore[0];
        team2ScoreEl.textContent = event.newScore[1];
        scorerTextEl.textContent = `Goal: ${event.scorer} (${currentMinute}')`;
        scorerInfoEl.style.display = 'flex';
    } else if (event.type === 'foul') {
        // Show foul notification - extract player name from text if possible
        console.log('Showing foul notification'); // Debug
        const playerMatch = event.text.match(/([A-Z][a-z]+ [A-Z][a-z]+|[A-Z][a-z]+)/);
        const playerName = playerMatch ? playerMatch[1] : 'Player';
        const foulText = `Yellow Card: ${playerName}`;
        foulTimeout = showTemporaryNotification(foulInfoEl, foulText, 4000, foulTimeout);
    } else if (event.type === 'corner') {
        // Show corner notification
        console.log('Showing corner notification'); // Debug
        const cornerText = 'Corner kick';
        cornerTimeout = showTemporaryNotification(cornerInfoEl, cornerText, 3000, cornerTimeout);
    } else if (event.type === 'booking') {
        // Show booking as a foul notification with longer duration
        console.log('Showing booking notification'); // Debug
        const playerMatch = event.text.match(/([A-Z][a-z]+ [A-Z][a-z]+|[A-Z][a-z]+)/);
        const playerName = playerMatch ? playerMatch[1] : 'Player';
        const bookingText = `Yellow Card: ${playerName}`;
        foulTimeout = showTemporaryNotification(foulInfoEl, bookingText, 5000, foulTimeout);
    }
}
            
            // Generate summary every 3 minutes or at the last event
            if (commentaryBuffer.length > 0 && (currentMinute % 3 === 0 || isLastEvent)) {
                loaderEl.style.display = 'block';
                snippetTextEl.style.opacity = '0';

                const combinedText = commentaryBuffer.join(' ');
                console.log('Generating summary for:', combinedText); // Debug log
                
                // Call Gemini directly from the extension
                const snippet = await summarizeWithGemini(combinedText);
                
                snippetTextEl.textContent = snippet;
                
                loaderEl.style.display = 'none';
                snippetTextEl.style.opacity = '1';
                commentaryBuffer = [];
            }

            lastUpdatedEl.textContent = new Date().toLocaleTimeString();

            if (isLastEvent) {
                clearInterval(gameInterval);
                document.getElementById('live-indicator').style.display = 'none';
                matchTimeEl.textContent = 'FT';
                console.log('Match simulation completed');
            }
        };

        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(runSimulation, SIMULATION_SPEED_MS);
    }
    
    // --- UI HELPER FUNCTIONS ---
    function toggleView(showMatch) {
        selectionSection.style.display = showMatch ? 'none' : 'flex';
        matchDisplay.style.display = showMatch ? 'block' : 'none';
        if (!showMatch) {
            if (gameInterval) clearInterval(gameInterval);
            gameInterval = null;
        }
    }
    
    function populateMatchList() {
        matchListEl.innerHTML = '';
        for (const matchId in MATCH_DATA) {
            const match = MATCH_DATA[matchId];
            const item = document.createElement('div');
            item.className = 'match-item';
            item.dataset.matchId = matchId;
            item.innerHTML = `
                <span class="match-item-teams">
                    ${match.homeTeam.name} <span class="vs">vs</span> ${match.awayTeam.name}
                </span>
                <span class="match-item-status">DEMO</span>
            `;
            item.addEventListener('click', () => startMatchSimulation(matchId));
            matchListEl.appendChild(item);
        }
    }

    // --- INITIALIZATION ---
    changeMatchButton.addEventListener('click', () => {
        toggleView(false);
    });
    
    populateMatchList();
    toggleView(false); // Start on the selection screen
});