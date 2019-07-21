var prompt_dom = document.getElementById('prompt');
var options_dom = document.getElementById('options');
var option_dom = document.getElementById('option_template').cloneNode();
option_dom.className = 'option';
var options = [];
var steps = [];

var setPrompt = function(text){
  prompt_dom.innerHTML = text;
}

var addOption = function(text, id){
  let option = option_dom.cloneNode();
  option.innerHTML = text;

  option.onmouseup = function(){
    console.log(id);
    steps[id].display();
  }

  options.push(option);
  options_dom.appendChild(option);
};

var clearOptions = function(){
  let count = options.length;
  for(let i = 0; i < count; i++){
    options_dom.removeChild(options.pop());
  }
};


class Step{
  constructor(id, prompt, opts, nexts){
    this.id = id;
    this.prompt = prompt;
    this.options = opts.slice();
    this.nexts = nexts.slice();
  }

  display(){
    setPrompt(this.prompt);
    clearOptions();
    for(let i = 0; i < this.options.length; i++){
      addOption(this.options[i], this.nexts[i]);
    }
  }
}

steps = [
new Step(0, 'You wake up and find yourself in a room with three doors. Choose a path.', [
  'enter door 1',
  'enter door 2',
  'enter door 3',
  'wait'
], [1, 2, 3, 4]),
new Step(1, 'You die instantly. Yikes.',[
  'retry'
], [0]),
new Step(2, 'You look around and see nothing but an endless shallow pool. Turning around you see that your entrance has disappeared and been replaced by a spiral staircase.',[
  'climb up',
  'wait'
], [47, 21]),
new Step(3, 'You die instantly. Maybe try harder next time.',[
  'retry'
], [0]),
new Step(4, 'The ceiling opens up and you see the dark sky above you. A ladder decends. This is definately not a trap.',[
  'climb ladder',
  'wait'
], [5, 6]),
new Step(5, 'You begin to climb the ladder, but as you climb it only grows longer and longer. After a significant amount of climbing you need to make a commitment.',[
  'continue climbing',
  'do one of those things where you slide down the ladder real fast'
], [11, 7]),
new Step(6, 'The ladder falls over and kills you. Probably because you chose the boring option both times.',[
  'retry'
], [0]),
new Step(7, 'You start sliding and pick up some speed, but then you look up and see a dwarf sliding after you.', [
  'stop sliding',
  'let go'
], [9, 8]),
new Step(8, 'You fall to the ground and die.',[
  'retry'
], [0]),
new Step(9, 'You stop suddenly. The dwarf tries to get enough grip to stop but cannot; you have been sweating profusely due to fear and have coated the ladder above you. The little person hits you, then falls to his death.',[
  'nice',
  'nice',
  'nice',
  'climb back up'
], [10, 10, 10, 11]),
new Step(10, 'Nice. You take a well earned rest but are suddenly struck from above by another little person and you promptly die',[
  'retry'
], [0]),
new Step(11, 'You continue to climb. The ladder slowly stops extending to reach a single cloud floating in place in the sky.',[
  'step out onto the cloud',
  'wait'
], [12, 13]),
new Step(12, 'You try to step on a cloud. You fall to your death.',[
  'retry'
], [0]),
new Step(13, 'The ladder suddenly jolts upward, launching you into the sky. Above you see a bright light coming out of an opening.',[
  'try to grab the opening',
  'try to grab the ladder',
  'wait'
], [17,15,14]),
new Step(14, 'You hesitate to grab anything and fall to your death.', [
  'retry'
], [0]),
new Step(15, 'You successfully grab the ladder and once again see the single cloud.',[
  'step out onto the cloud',
  'slide down the ladder'
], [12, 16]),
new Step(16, 'You slide down the ladder and eventually return to the room with three doors, your hands sweaty and torn.', [
  'enter door 1',
  'enter door 2',
  'enter door 3'
], [1, 2, 3]),
new Step(17, 'You just manage to reach the opening and pull yourself up.', [
  'jump back through the opening',
  'look around'
], [18, 2]),
new Step(18, 'You jump down but the ladder is gone, your only hope is to aim for the cloud',[
  'aim for the cloud',
  'die'
], [20, 19]),
new Step(19, 'You fall to your death. Seriously the cloud was the only hope.', [
  'retry'
], [0]),
new Step(20, 'You aim for the cloud and fall through it. You then fall to your death.', [
  'retry'
], [0]),
new Step(21, 'As you wait you feel water slowly rising up your leg.', [
  'climb the staircase',
  'lie down in the water'
], [53, 22]),
new Step(22, 'Vines from the bottom of the pool wrap around, grab, and pull you under the water.', [
  'struggle',
  'relax'
], [24, 23]),
new Step(23, 'You relax as the vines hold you underwater. You drown.', [
  'retry'
], [0]),
new Step(24, 'Every pull against the vines gives you more freedom, but the water is rising faster than you can pull and the vines are still securely tied to you.', [
  'keep pulling',
  'swim back down',
  'wait'
], [25, 38, 23]),
new Step(25, 'The water keeps rising as you pull, looking down you see that the pool is now at least 50 feet deep. Next to you is the staircase still, and above the water is too far to see the surface.', [
  'find an air pocket in the staircase',
  'swim down'
], [26, 38]),
new Step(26, 'You reach a pocket of air just as your breath runs out. As you catch your breath you notice hundreds of small spiders occupying the same bubble as you.', [
  'attack the spiders',
  'wait'
], [27, 29]),
new Step(27, 'The spiders quickly retaliate, growing in size then jumping on and biting your face',[
  'give up',
  'swat your face'
], [28, 28]),
new Step(28, 'Any action is too late, the venom sets in and you are paralyzed. You sink into the water and drown.', [
  'retry'
], [0]),
new Step(29, 'The spiders stay calm and keep their distance, but the vines start to pull you down again.', [
  'rip the vines',
  'let the vines pull'
], [30, 38]),
new Step(30, 'The vines rip open suprisingly easily and you notice hollow tubes inside of them. Soon spiders start being sucked down the tubes and your air bubble shrinks.', [
  'submerge the vines',
  'suck all the spiders into the vines'
], [31, 39]),
new Step(31, 'The vines start sucking in water, and you see that the surface of the water is lowering.', [
  'swim to the surface',
  'wait'
], [44, 32]),
new Step(32, 'As you wait, you notice the spiders all looking at you instead of crawling around the bubble. Soon the surface of the water reaches the bubble and you decend downwards.',[
  'land on the staircase',
  'return to the ground'
], [33, 60]),
new Step(33, 'You step on the staircase just below what was your bubble as the water lowers below you. You look up to see the spiders growing in size rapidly and starting jumping down the staircase towards you.', [
  'jump off of the staircase',
  'fight'
], [35, 34]),
new Step(34, 'The spiders are now the size of dogs and they quickly overpower you. One bite of venom kills you.',[
  'retry'
], [0]),
new Step(35, 'You jump and fall through the air before landing in what is left of the water. Above you see the spiders jumping after you, some landing on the ground safely and others dying on impact.', [
  'dig through the vines',
  'fight'
], [37, 36]),
new Step(36, 'Even with the spiders reduced numbers, you are quickly overpowered and die.', [
  'retry'
], [0]),
new Step(37, 'You dig through the layer of vines and they close above you with a nearly water-tight seal. Underneath the vines is a single tunnel lit by candles.', [
  'enter the tunnel',
  'light the vines on fire with a candle'
], [63, 62]),
new Step(38, 'You follow the vines to their base but they soon pull you tight to the ground. Your breath is running low and the surface of the water is clearly too far away now', [
  'rip and dig through the vines',
  'wait'
], [37, 23]),
new Step(39, 'The spiders start growing in size as they notice the others being sucked away, soon they are too big to fit in the vine and the suction stops.', [
  'swim down',
  'fight'
], [38, 40]),
new Step(40, 'Only a few spiders remain, and you are able to punch them to death while treading water. Below you, however, the vine is torn to shreds and hundreds spiders the size of dogs are swimming towards you.', [
  'accept death',
  'swim up'
], [41, 42]),
new Step(41, 'Good call on that one, you were definately gonna die. Also you die.', [
  'retry'
], [0]),
new Step(42, 'The surface of the water seems impossibly far away now, but the spiders below you are for sure gonna kill you if you give up', [
  'give up',
  'keep swimming'
], [41, 43]),
new Step(43, 'You reach the surface of the water to see the beautiful night sky. You are then murdered by dog sized spiders.', [
  'retry'
], [0]),
new Step(44, 'You reach the surface of the water to again see the night sky. The staircase spirals past any clouds drifting by.', [
  'swim to the staircase',
  'ride the water to the ground'
], [45, 60]),
new Step(45, 'You reach the staircase and rest. The water is now gone from below you and the staircase spirals seemingly endlessly above you.', [
  'jump',
  'climb'
], [46, 47]),
new Step(46, 'You fall to your death.', [
  'retry'
], [0]),
new Step(47, 'You begin to climb the endless staircase. You occasionally peek upwards to possibly see an end, but are always dissapointed. Your legs grow tired and you need to rest.', [
  'jump',
  'climb'
], [46, 48]),
new Step(48, 'You push yourself to keep climbing. After another long while you find a rope attached to some kind of lever above you.', [
  'keep climbing',
  'pull the lever',
  'jump'
], [49, 52, 46]),
new Step(49, 'The lever is now far below you, only the endless staircase remains.', [
  'climb',
  'jump'
], [50, 46]),
new Step(50, 'Step.', [
  'left foot',
  'right foot',
  'jump'
], [51, 51, 46]),
new Step(51, 'Another step.', [
  'left foot',
  'right foot',
  'jump'
], [50, 50, 46]),
new Step(52, 'You pull the lever and hear a rush of water far below you. Looking down you see the reflection of the night sky above.',[
  'climb',
  'jump'
], [53, 59]),
new Step(53, 'The water rushes below you as you sprint up the staircase.', [
  'keep climbing',
  'jump'
], [54, 59]),
new Step(54, 'You keep climbing but the water outpaces you. There is no hope in climbing anymore.', [
  'climb',
  'swim down',
  'float up'
], [55, 57, 56]),
new Step(55, 'The water rises above your head but you keep trying to climb the stairs. You drown.', [
  'retry'
], [0]),
new Step(56, 'You rise on the water until your entire body is pruned and soaked with water. The only things in view are the endless staircase and a vast ocean of rising water. Somehow in this situation you die. Sorry.', [
  'retry'
], [0]),
new Step(57, 'After what seems like an endless decent through the water you reach a bed of vines. A few feet away you see bubbles rising through them.',[
  'dig through the vines here',
  'dig through the vines where the bubbles are'
], [37, 58]),
new Step(58, 'You dig through the bubbles to find a cavern being drowned below you. You fall into the water and struggle before the cavern fills and you are drowned.', [
  'retry'
], [0]),
new Step(59, 'You jump and fall through the air for minutes before finally impacting the water. Somehow you survive the fall and must make a decision.', [
  'swim down',
  'float up in the water'
], [57, 56]),
new Step(60, 'You ride the water down to find a vast floor of dark vines. The staircase towers above you and beckons to be climbed', [
  'climb',
  'dig through the vines'
], [61, 37]),
new Step(61, 'As you start the climb you notice the comfort of climbing. One step followed by another you climb forever.', [
  'climb'
], [50]),
new Step(62, 'The vines burn to show a plain ceiling above them and, after climbing up, you see three doors.', [
  'enter door 1',
  'enter door 2',
  'enter door 3',
  'wait'
], [1, 2, 3, 4]),
new Step(63, 'Further down the cavern you find a dwarf extinguising candles, progressing towards you.', [
  'continue forward',
  'fight'
], [65, 64]),
new Step(64, 'You pick them up and body slam them to the ground. One punch and the dwarf is unconscious.', [
  'nice',
  'continue'
], [10, 65]),
new Step(65, 'A dark cavern extends forwards and breaks into three tunnels. Make an entirely uninformed decision.', [
  'right',
  'left',
  'the one with a trap'
], [67, 83, 66]),
new Step(66, 'You die from a trap.', [
  'retry'
], [0]),
new Step(67, 'As the tunnel extends forward the passage becomes smaller until you have to crawl through it.', [
  'crawl forward',
  'try to break through the tunnel'
], [68, 78]),
new Step(68, 'The tunnel keeps constricting as you crawl forward. Small hairs protruding from the walls start pulling you forward.', [
  'let them pull',
  'resist'
], [69, 77]),
new Step(69, 'The tunnel pulls you forward faster. You lay down to fit through the now tiny opening. After a while the tunnel opens into the top of a much larger cavern with a bubbling liquid inside.', [
  'try to hold on to the tunnel',
  'fall into the liquid'
], [71, 70]),
new Step(70, 'You fall into the liquid and it burns your skin. You struggle while the acid dissolves you.', [
  'retry'
], [0]),
new Step(71, 'You just barely grab a bundle of hair. The hairs struggle to break free but your grip is solid.', [
  'try to dig out of the tunnel',
  'wait'
], [78, 72]),
new Step(72, 'As you wait a dwarf comes through the tunnel and also grabs a bundle of hair next to you.', [
  'fight',
  'wait'
], [73, 74]),
new Step(73, 'Both of you erupt with pointless aggression simultaneously. Amidst the struggle both of your bundles of hair rip and you die in the liquid below.', [
  'retry'
], [0]),
new Step(74, 'You both wait, looking down at the water and at eachother. Both of you know that death is unavoidable.', [
  'let go',
  'wait'
], [75, 76]),
new Step(75, 'You both let go at the same time and fall into the liquid below. You struggle as the liquid dissolves you.', [
  'retry'
], [0]),
new Step(76, 'You and your dwarf companion wait until, from above, you hear a blast of water coming through the tunnel. Both of you are struck and perish in the harsh liquid below.', [
  'retry'
], [0]),
new Step(77, 'As you resist the tunnel jolts violently, constricting rapidly and crushing you.', [
  'retry'
], [0]),
new Step(78, 'The tunnel rips open easily and a blast of water rushes in.', [
  'swim out',
  'ride the water up'
], [82, 79]),
new Step(79, 'You ride the water up and it stops at the split in the cavern. The right path is now completely flooded and impassible.', [
  'left path',
  'the path with a trap'
], [83, 66]),
new Step(80, 'You notice a slight breeze coming from the path ahead. Eventually you arrive at a massive opening, where only the night sky and a ladder extending down endlessly can be seen.', [
  'jump to the ladder',
  'jump into the air'
], [81, 46]),
new Step(81, 'You barely grab the ladder. You can see a light far away at the bottom.', [
  'slide down',
  'jump'
], [16, 46]),
new Step(82, 'You manage to swim through the violent flow of water. Looking around you see endless water, an air tank, and a propane torch. You pick up both.', [
  'breathe from the tank',
  're-enter the cavern'
], [86, 85]),
new Step(83, 'You walk down the dark tunnel until you find a hole in the path ahead. Looking through you see two dwarfs fighting below.', [
  'join the fight',
  'continue'
], [84, 80]),
new Step(84, 'You fall from above and instantly kill the one remaining dwarf on impact.', [
  'nice',
  'follow the tunnel'
], [10, 65]),
new Step(85, 'The water pushes you quickly down the tunnel as you struggle to grip the walls. Soon the tunnel becomes too narrow to fit through and you drown in the flowing water.',[
  'retry'
], [0]),
new Step(86, 'You breathe from the tank and swim away from the suction of the cavern. You see the surface of the water far above you, and a group of sharks below you. Don\'t be a pussy.', [
  'swim up',
  'swim down'
], [87, 95]),
new Step(87, 'As you grow closer to the top you see the sun shining through creating rainbow patterns on the surface. You break through and see the night sky above.', [
  'use the torch to signal for help',
  'swim down',
  'drink the water'
], [88, 95, 102]),
new Step(88, 'The torch is too waterlogged to work.', [
  'use the air tank to dry the torch',
  'drink the water'
], [89, 102]),
new Step(89, 'The torch dries after a while. You see rainbow patterns glistening off of the surface of the water as you prepare to signal for help.', [
  'signal for help',
  'swim down'
], [90, 95]),
new Step(90, 'You light the torch and the surface of the water erupts in flame. You start to burn.', [
  'blow out the fire with the air tank',
  'submerge yourself'
], [91, 92]),
new Step(91, 'Blowing air onto the fire only makes it burn brighter. You see endless flames all around you on top of the water as you burn to death.', [
  'retry'
], [0]),
new Step(92, 'The flames quickly dissapear as you submerge. Looking up you see the surface of water glowing bright with flames.', [
  'swim down',
  'wait'
], [95, 93]),
new Step(93, 'You breathe from the air tank and watch the flames above. Patience pays off as the flames dissipate after a few minutes.', [
  'return to the surface',
  'swim down'
], [94, 95]),
new Step(94, 'Hoping that help has come after the flash of light you emerge from the water. Except instead of the night sky all you see is a room with three doors. You step in.', [
  'enter door 1',
  'enter door 2',
  'enter door 3',
  'wait'
], [1, 2, 3, 4]),
new Step(95, 'You swim down towards the circling sharks. One approaches menacingly.', [
  'fend it off with the torch',
  'wait'
], [96, 97]),
new Step(96, 'You spray air in front of you from the air tank and light the torch inside of it. A large flash of light blinds the shark.', [
  'shove your hands into its eyes',
  'run'
], [98, 101]),
new Step(97, 'The shark eats you.', [
  'retry'
], [0]),
new Step(98, 'You blind one shark by stabbing its eyes but get cut in the process. The rest of the sharks circle you.', [
  'blind them with the torch',
  'run'
], [99, 100]),
new Step(99, 'All but the shark behind you are blinded temporarily. The one shark with vision kills you.', [
  'retry'
], [0]),
new Step(100, 'You try to run but the sharks smell the blood leaking from your cut. They chase you down and do a chomp on you.', [
  'retry'
], [0]),
new Step(101, 'You try to run but sharks are pretty fast. They catch and murder you.', [
  'retry'
], [0]),
new Step(102, 'You try to drink the water for some reason. It\'s salty and tastes like oil. You gasp for air but the oil fumes kill you. Why did you do that?', [
  'retry'
], [0]),
];

steps[0].display();
