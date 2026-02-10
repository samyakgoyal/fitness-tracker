// Comprehensive exercise database with muscle groups and equipment
export interface ExerciseTemplate {
  name: string;
  muscleGroup: string;
  equipment: string;
  aliases?: string[]; // Alternative names for matching
}

export const exerciseDatabase: ExerciseTemplate[] = [
  // CHEST
  { name: "Bench Press", muscleGroup: "chest", equipment: "barbell", aliases: ["flat bench", "barbell bench"] },
  { name: "Incline Bench Press", muscleGroup: "chest", equipment: "barbell", aliases: ["incline barbell press"] },
  { name: "Decline Bench Press", muscleGroup: "chest", equipment: "barbell" },
  { name: "Dumbbell Bench Press", muscleGroup: "chest", equipment: "dumbbell", aliases: ["db bench press", "dumbbell press"] },
  { name: "Incline Dumbbell Press", muscleGroup: "chest", equipment: "dumbbell", aliases: ["incline db press"] },
  { name: "Decline Dumbbell Press", muscleGroup: "chest", equipment: "dumbbell" },
  { name: "Dumbbell Fly", muscleGroup: "chest", equipment: "dumbbell", aliases: ["chest fly", "db fly", "flyes"] },
  { name: "Incline Dumbbell Fly", muscleGroup: "chest", equipment: "dumbbell" },
  { name: "Cable Fly", muscleGroup: "chest", equipment: "cable", aliases: ["cable crossover", "cable chest fly"] },
  { name: "Low Cable Fly", muscleGroup: "chest", equipment: "cable", aliases: ["low to high cable fly"] },
  { name: "High Cable Fly", muscleGroup: "chest", equipment: "cable", aliases: ["high to low cable fly"] },
  { name: "Incline Cable Fly", muscleGroup: "chest", equipment: "cable", aliases: ["inclined cable fly", "incline cable flys"] },
  { name: "Decline Cable Fly", muscleGroup: "chest", equipment: "cable", aliases: ["decline cable flys"] },
  { name: "Single Arm Cable Fly", muscleGroup: "chest", equipment: "cable", aliases: ["one arm cable fly"] },
  { name: "Chest Press Machine", muscleGroup: "chest", equipment: "machine", aliases: ["machine chest press"] },
  { name: "Pec Deck", muscleGroup: "chest", equipment: "machine", aliases: ["pec deck fly", "butterfly"] },
  { name: "Push Up", muscleGroup: "chest", equipment: "bodyweight", aliases: ["pushup", "press up"] },
  { name: "Diamond Push Up", muscleGroup: "chest", equipment: "bodyweight" },
  { name: "Wide Push Up", muscleGroup: "chest", equipment: "bodyweight" },
  { name: "Dips", muscleGroup: "chest", equipment: "bodyweight", aliases: ["chest dips", "parallel bar dips"] },
  { name: "Landmine Press", muscleGroup: "chest", equipment: "barbell" },
  { name: "Svend Press", muscleGroup: "chest", equipment: "dumbbell" },
  { name: "Floor Press", muscleGroup: "chest", equipment: "barbell", aliases: ["barbell floor press"] },
  { name: "Dumbbell Floor Press", muscleGroup: "chest", equipment: "dumbbell", aliases: ["db floor press"] },
  { name: "Smith Machine Bench Press", muscleGroup: "chest", equipment: "machine", aliases: ["smith bench"] },
  { name: "Smith Machine Incline Press", muscleGroup: "chest", equipment: "machine", aliases: ["smith incline press"] },
  { name: "Machine Fly", muscleGroup: "chest", equipment: "machine", aliases: ["fly machine"] },

  // BACK
  { name: "Deadlift", muscleGroup: "back", equipment: "barbell", aliases: ["conventional deadlift"] },
  { name: "Sumo Deadlift", muscleGroup: "back", equipment: "barbell" },
  { name: "Romanian Deadlift", muscleGroup: "hamstrings", equipment: "barbell", aliases: ["rdl", "stiff leg deadlift"] },
  { name: "Dumbbell Romanian Deadlift", muscleGroup: "hamstrings", equipment: "dumbbell", aliases: ["db rdl"] },
  { name: "Barbell Row", muscleGroup: "back", equipment: "barbell", aliases: ["bent over row", "bb row", "barbell bent over row"] },
  { name: "Pendlay Row", muscleGroup: "back", equipment: "barbell" },
  { name: "Dumbbell Row", muscleGroup: "back", equipment: "dumbbell", aliases: ["db row", "one arm row", "single arm row"] },
  { name: "Seated Cable Row", muscleGroup: "back", equipment: "cable", aliases: ["cable row", "low row"] },
  { name: "T-Bar Row", muscleGroup: "back", equipment: "barbell", aliases: ["t bar row"] },
  { name: "Lat Pulldown", muscleGroup: "lats", equipment: "cable", aliases: ["wide grip pulldown", "lat pull down"] },
  { name: "Close Grip Lat Pulldown", muscleGroup: "lats", equipment: "cable" },
  { name: "Pull Up", muscleGroup: "lats", equipment: "bodyweight", aliases: ["pullup", "chin up", "chinup"] },
  { name: "Wide Grip Pull Up", muscleGroup: "lats", equipment: "bodyweight" },
  { name: "Neutral Grip Pull Up", muscleGroup: "lats", equipment: "bodyweight" },
  { name: "Assisted Pull Up", muscleGroup: "lats", equipment: "machine" },
  { name: "Machine Row", muscleGroup: "back", equipment: "machine", aliases: ["chest supported row"] },
  { name: "Face Pull", muscleGroup: "shoulders", equipment: "cable", aliases: ["rear delt pull"] },
  { name: "Straight Arm Pulldown", muscleGroup: "lats", equipment: "cable", aliases: ["straight arm pushdown"] },
  { name: "Hyperextension", muscleGroup: "lower back", equipment: "bodyweight", aliases: ["back extension", "45 degree back extension"] },
  { name: "Good Morning", muscleGroup: "lower back", equipment: "barbell" },
  { name: "Rack Pull", muscleGroup: "back", equipment: "barbell" },
  { name: "Shrug", muscleGroup: "traps", equipment: "barbell", aliases: ["barbell shrug", "trap shrug"] },
  { name: "Dumbbell Shrug", muscleGroup: "traps", equipment: "dumbbell", aliases: ["db shrug"] },
  { name: "Meadows Row", muscleGroup: "lats", equipment: "barbell", aliases: ["landmine row"] },
  { name: "Chest Supported Row", muscleGroup: "back", equipment: "dumbbell", aliases: ["incline db row", "seal row"] },
  { name: "Single Arm Lat Pulldown", muscleGroup: "lats", equipment: "cable", aliases: ["one arm pulldown"] },
  { name: "Reverse Grip Lat Pulldown", muscleGroup: "lats", equipment: "cable", aliases: ["underhand pulldown"] },
  { name: "Behind Neck Lat Pulldown", muscleGroup: "lats", equipment: "cable" },
  { name: "Cable Shrug", muscleGroup: "traps", equipment: "cable" },
  { name: "Smith Machine Shrug", muscleGroup: "traps", equipment: "machine" },
  { name: "Trap Bar Deadlift", muscleGroup: "back", equipment: "barbell", aliases: ["hex bar deadlift"] },
  { name: "Deficit Deadlift", muscleGroup: "back", equipment: "barbell" },
  { name: "Block Pull", muscleGroup: "back", equipment: "barbell" },
  { name: "Snatch Grip Deadlift", muscleGroup: "back", equipment: "barbell" },

  // SHOULDERS
  { name: "Overhead Press", muscleGroup: "shoulders", equipment: "barbell", aliases: ["ohp", "military press", "shoulder press", "barbell press"] },
  { name: "Seated Overhead Press", muscleGroup: "shoulders", equipment: "barbell" },
  { name: "Dumbbell Shoulder Press", muscleGroup: "shoulders", equipment: "dumbbell", aliases: ["db shoulder press", "seated dumbbell press"] },
  { name: "Arnold Press", muscleGroup: "shoulders", equipment: "dumbbell" },
  { name: "Push Press", muscleGroup: "shoulders", equipment: "barbell" },
  { name: "Lateral Raise", muscleGroup: "shoulders", equipment: "dumbbell", aliases: ["side raise", "side lateral raise", "db lateral raise"] },
  { name: "Cable Lateral Raise", muscleGroup: "shoulders", equipment: "cable" },
  { name: "Front Raise", muscleGroup: "shoulders", equipment: "dumbbell", aliases: ["front delt raise"] },
  { name: "Rear Delt Fly", muscleGroup: "shoulders", equipment: "dumbbell", aliases: ["reverse fly", "bent over lateral raise", "rear delt raise"] },
  { name: "Cable Rear Delt Fly", muscleGroup: "shoulders", equipment: "cable" },
  { name: "Upright Row", muscleGroup: "shoulders", equipment: "barbell", aliases: ["barbell upright row"] },
  { name: "Dumbbell Upright Row", muscleGroup: "shoulders", equipment: "dumbbell" },
  { name: "Machine Shoulder Press", muscleGroup: "shoulders", equipment: "machine" },
  { name: "Reverse Pec Deck", muscleGroup: "shoulders", equipment: "machine", aliases: ["rear delt machine"] },
  { name: "Handstand Push Up", muscleGroup: "shoulders", equipment: "bodyweight", aliases: ["hspu"] },
  { name: "Pike Push Up", muscleGroup: "shoulders", equipment: "bodyweight" },
  { name: "Lu Raise", muscleGroup: "shoulders", equipment: "dumbbell" },
  { name: "Y Raise", muscleGroup: "shoulders", equipment: "dumbbell" },
  { name: "Incline Lateral Raise", muscleGroup: "shoulders", equipment: "dumbbell", aliases: ["leaning lateral raise"] },
  { name: "Machine Lateral Raise", muscleGroup: "shoulders", equipment: "machine" },
  { name: "Landmine Lateral Raise", muscleGroup: "shoulders", equipment: "barbell" },
  { name: "Smith Machine Overhead Press", muscleGroup: "shoulders", equipment: "machine", aliases: ["smith press"] },
  { name: "Cable Front Raise", muscleGroup: "shoulders", equipment: "cable" },
  { name: "Single Arm Dumbbell Press", muscleGroup: "shoulders", equipment: "dumbbell", aliases: ["one arm shoulder press"] },
  { name: "Incline Rear Delt Fly", muscleGroup: "shoulders", equipment: "dumbbell", aliases: ["prone rear delt fly"] },

  // BICEPS
  { name: "Barbell Curl", muscleGroup: "biceps", equipment: "barbell", aliases: ["bb curl", "standing barbell curl"] },
  { name: "EZ Bar Curl", muscleGroup: "biceps", equipment: "barbell", aliases: ["ez curl", "easy bar curl"] },
  { name: "Dumbbell Curl", muscleGroup: "biceps", equipment: "dumbbell", aliases: ["db curl", "bicep curl", "standing curl"] },
  { name: "Hammer Curl", muscleGroup: "biceps", equipment: "dumbbell", aliases: ["db hammer curl"] },
  { name: "Incline Dumbbell Curl", muscleGroup: "biceps", equipment: "dumbbell", aliases: ["incline curl"] },
  { name: "Preacher Curl", muscleGroup: "biceps", equipment: "barbell", aliases: ["scott curl"] },
  { name: "Dumbbell Preacher Curl", muscleGroup: "biceps", equipment: "dumbbell" },
  { name: "Concentration Curl", muscleGroup: "biceps", equipment: "dumbbell" },
  { name: "Cable Curl", muscleGroup: "biceps", equipment: "cable", aliases: ["cable bicep curl"] },
  { name: "Cable Hammer Curl", muscleGroup: "biceps", equipment: "cable", aliases: ["rope hammer curl"] },
  { name: "Spider Curl", muscleGroup: "biceps", equipment: "dumbbell" },
  { name: "Drag Curl", muscleGroup: "biceps", equipment: "barbell" },
  { name: "Reverse Curl", muscleGroup: "biceps", equipment: "barbell", aliases: ["reverse barbell curl"] },
  { name: "Zottman Curl", muscleGroup: "biceps", equipment: "dumbbell" },
  { name: "Machine Curl", muscleGroup: "biceps", equipment: "machine", aliases: ["bicep machine"] },
  { name: "21s", muscleGroup: "biceps", equipment: "barbell", aliases: ["21 curls"] },
  { name: "Cross Body Hammer Curl", muscleGroup: "biceps", equipment: "dumbbell", aliases: ["crossbody curl"] },
  { name: "Waiter Curl", muscleGroup: "biceps", equipment: "dumbbell" },
  { name: "Bayesian Curl", muscleGroup: "biceps", equipment: "cable", aliases: ["behind body curl"] },
  { name: "Cable EZ Bar Curl", muscleGroup: "biceps", equipment: "cable" },
  { name: "Prone Incline Curl", muscleGroup: "biceps", equipment: "dumbbell", aliases: ["spider curl dumbbell"] },
  { name: "Alternating Dumbbell Curl", muscleGroup: "biceps", equipment: "dumbbell", aliases: ["alternating curl"] },

  // TRICEPS
  { name: "Close Grip Bench Press", muscleGroup: "triceps", equipment: "barbell", aliases: ["cgbp", "close grip press"] },
  { name: "Skull Crusher", muscleGroup: "triceps", equipment: "barbell", aliases: ["lying tricep extension", "french press", "skullcrusher"] },
  { name: "Dumbbell Skull Crusher", muscleGroup: "triceps", equipment: "dumbbell" },
  { name: "Tricep Pushdown", muscleGroup: "triceps", equipment: "cable", aliases: ["cable pushdown", "tricep pressdown", "pushdown"] },
  { name: "Rope Pushdown", muscleGroup: "triceps", equipment: "cable", aliases: ["tricep rope pushdown", "rope tricep extension"] },
  { name: "Overhead Tricep Extension", muscleGroup: "triceps", equipment: "dumbbell", aliases: ["tricep extension", "french press dumbbell"] },
  { name: "Cable Overhead Extension", muscleGroup: "triceps", equipment: "cable" },
  { name: "Tricep Kickback", muscleGroup: "triceps", equipment: "dumbbell", aliases: ["kickback", "db kickback"] },
  { name: "Dip", muscleGroup: "triceps", equipment: "bodyweight", aliases: ["tricep dip", "bench dip"] },
  { name: "Diamond Push Up", muscleGroup: "triceps", equipment: "bodyweight", aliases: ["close grip push up"] },
  { name: "JM Press", muscleGroup: "triceps", equipment: "barbell" },
  { name: "Tate Press", muscleGroup: "triceps", equipment: "dumbbell" },
  { name: "Machine Tricep Extension", muscleGroup: "triceps", equipment: "machine" },
  { name: "Single Arm Pushdown", muscleGroup: "triceps", equipment: "cable", aliases: ["one arm pushdown"] },
  { name: "Straight Bar Pushdown", muscleGroup: "triceps", equipment: "cable", aliases: ["bar pushdown"] },
  { name: "V Bar Pushdown", muscleGroup: "triceps", equipment: "cable", aliases: ["v-bar pushdown"] },
  { name: "EZ Bar Skull Crusher", muscleGroup: "triceps", equipment: "barbell" },
  { name: "Seated Tricep Extension", muscleGroup: "triceps", equipment: "dumbbell" },
  { name: "Bench Dip", muscleGroup: "triceps", equipment: "bodyweight", aliases: ["chair dip"] },

  // LEGS - QUADRICEPS
  { name: "Squat", muscleGroup: "quadriceps", equipment: "barbell", aliases: ["back squat", "barbell squat", "bb squat"] },
  { name: "Front Squat", muscleGroup: "quadriceps", equipment: "barbell" },
  { name: "Goblet Squat", muscleGroup: "quadriceps", equipment: "dumbbell", aliases: ["db goblet squat"] },
  { name: "Hack Squat", muscleGroup: "quadriceps", equipment: "machine" },
  { name: "Leg Press", muscleGroup: "quadriceps", equipment: "machine", aliases: ["45 degree leg press"] },
  { name: "Leg Extension", muscleGroup: "quadriceps", equipment: "machine", aliases: ["quad extension"] },
  { name: "Bulgarian Split Squat", muscleGroup: "quadriceps", equipment: "dumbbell", aliases: ["bss", "rear foot elevated split squat"] },
  { name: "Lunge", muscleGroup: "quadriceps", equipment: "bodyweight", aliases: ["walking lunge", "forward lunge"] },
  { name: "Dumbbell Lunge", muscleGroup: "quadriceps", equipment: "dumbbell", aliases: ["db lunge"] },
  { name: "Barbell Lunge", muscleGroup: "quadriceps", equipment: "barbell" },
  { name: "Reverse Lunge", muscleGroup: "quadriceps", equipment: "dumbbell" },
  { name: "Step Up", muscleGroup: "quadriceps", equipment: "dumbbell", aliases: ["box step up"] },
  { name: "Sissy Squat", muscleGroup: "quadriceps", equipment: "bodyweight" },
  { name: "Wall Sit", muscleGroup: "quadriceps", equipment: "bodyweight" },
  { name: "Box Squat", muscleGroup: "quadriceps", equipment: "barbell" },
  { name: "Pause Squat", muscleGroup: "quadriceps", equipment: "barbell" },
  { name: "Safety Bar Squat", muscleGroup: "quadriceps", equipment: "barbell", aliases: ["ssb squat"] },
  { name: "Belt Squat", muscleGroup: "quadriceps", equipment: "machine" },
  { name: "Pendulum Squat", muscleGroup: "quadriceps", equipment: "machine" },
  { name: "V Squat", muscleGroup: "quadriceps", equipment: "machine" },
  { name: "Smith Machine Squat", muscleGroup: "quadriceps", equipment: "machine", aliases: ["smith squat"] },
  { name: "Sumo Squat", muscleGroup: "quadriceps", equipment: "dumbbell", aliases: ["wide stance squat", "plie squat"] },
  { name: "Landmine Squat", muscleGroup: "quadriceps", equipment: "barbell" },
  { name: "Single Leg Leg Press", muscleGroup: "quadriceps", equipment: "machine", aliases: ["one leg press"] },
  { name: "Split Squat", muscleGroup: "quadriceps", equipment: "bodyweight" },
  { name: "Dumbbell Split Squat", muscleGroup: "quadriceps", equipment: "dumbbell" },
  { name: "Cyclist Squat", muscleGroup: "quadriceps", equipment: "dumbbell", aliases: ["heel elevated squat"] },
  { name: "Zercher Squat", muscleGroup: "quadriceps", equipment: "barbell" },

  // LEGS - HAMSTRINGS
  { name: "Leg Curl", muscleGroup: "hamstrings", equipment: "machine", aliases: ["lying leg curl", "hamstring curl"] },
  { name: "Seated Leg Curl", muscleGroup: "hamstrings", equipment: "machine" },
  { name: "Nordic Curl", muscleGroup: "hamstrings", equipment: "bodyweight", aliases: ["nordic hamstring curl"] },
  { name: "Glute Ham Raise", muscleGroup: "hamstrings", equipment: "machine", aliases: ["ghr"] },
  { name: "Kettlebell Swing", muscleGroup: "hamstrings", equipment: "kettlebell", aliases: ["kb swing"] },
  { name: "Single Leg Romanian Deadlift", muscleGroup: "hamstrings", equipment: "dumbbell", aliases: ["single leg rdl", "one leg rdl"] },
  { name: "Good Morning", muscleGroup: "hamstrings", equipment: "barbell" },
  { name: "Standing Leg Curl", muscleGroup: "hamstrings", equipment: "machine" },
  { name: "Cable Leg Curl", muscleGroup: "hamstrings", equipment: "cable" },
  { name: "Sumo Romanian Deadlift", muscleGroup: "hamstrings", equipment: "barbell", aliases: ["sumo rdl"] },
  { name: "Dumbbell Swing", muscleGroup: "hamstrings", equipment: "dumbbell", aliases: ["db swing"] },

  // LEGS - GLUTES
  { name: "Hip Thrust", muscleGroup: "glutes", equipment: "barbell", aliases: ["barbell hip thrust", "glute bridge"] },
  { name: "Dumbbell Hip Thrust", muscleGroup: "glutes", equipment: "dumbbell" },
  { name: "Cable Pull Through", muscleGroup: "glutes", equipment: "cable", aliases: ["pull through"] },
  { name: "Glute Kickback", muscleGroup: "glutes", equipment: "cable", aliases: ["cable kickback", "donkey kick"] },
  { name: "Hip Abduction", muscleGroup: "glutes", equipment: "machine", aliases: ["abductor machine"] },
  { name: "Hip Adduction", muscleGroup: "glutes", equipment: "machine", aliases: ["adductor machine"] },
  { name: "Frog Pump", muscleGroup: "glutes", equipment: "bodyweight" },
  { name: "Single Leg Glute Bridge", muscleGroup: "glutes", equipment: "bodyweight" },
  { name: "Machine Hip Thrust", muscleGroup: "glutes", equipment: "machine" },
  { name: "Fire Hydrant", muscleGroup: "glutes", equipment: "bodyweight" },
  { name: "Clamshell", muscleGroup: "glutes", equipment: "bodyweight", aliases: ["clam shell"] },
  { name: "Banded Glute Bridge", muscleGroup: "glutes", equipment: "other", aliases: ["resistance band glute bridge"] },
  { name: "Cable Abduction", muscleGroup: "glutes", equipment: "cable" },
  { name: "Reverse Hyperextension", muscleGroup: "glutes", equipment: "machine", aliases: ["reverse hyper"] },

  // LEGS - CALVES
  { name: "Standing Calf Raise", muscleGroup: "calves", equipment: "machine", aliases: ["calf raise", "machine calf raise"] },
  { name: "Seated Calf Raise", muscleGroup: "calves", equipment: "machine" },
  { name: "Donkey Calf Raise", muscleGroup: "calves", equipment: "machine" },
  { name: "Smith Machine Calf Raise", muscleGroup: "calves", equipment: "machine" },
  { name: "Dumbbell Calf Raise", muscleGroup: "calves", equipment: "dumbbell", aliases: ["db calf raise"] },
  { name: "Single Leg Calf Raise", muscleGroup: "calves", equipment: "bodyweight" },
  { name: "Leg Press Calf Raise", muscleGroup: "calves", equipment: "machine", aliases: ["calf raise on leg press"] },
  { name: "Barbell Calf Raise", muscleGroup: "calves", equipment: "barbell" },

  // CORE / ABS
  { name: "Crunch", muscleGroup: "abs", equipment: "bodyweight", aliases: ["ab crunch", "abdominal crunch"] },
  { name: "Cable Crunch", muscleGroup: "abs", equipment: "cable", aliases: ["kneeling cable crunch"] },
  { name: "Sit Up", muscleGroup: "abs", equipment: "bodyweight", aliases: ["situp"] },
  { name: "Leg Raise", muscleGroup: "abs", equipment: "bodyweight", aliases: ["lying leg raise"] },
  { name: "Hanging Leg Raise", muscleGroup: "abs", equipment: "bodyweight", aliases: ["hanging knee raise"] },
  { name: "Captain Chair Leg Raise", muscleGroup: "abs", equipment: "bodyweight" },
  { name: "Plank", muscleGroup: "core", equipment: "bodyweight", aliases: ["front plank"] },
  { name: "Side Plank", muscleGroup: "obliques", equipment: "bodyweight" },
  { name: "Russian Twist", muscleGroup: "obliques", equipment: "bodyweight", aliases: ["seated twist"] },
  { name: "Bicycle Crunch", muscleGroup: "obliques", equipment: "bodyweight" },
  { name: "Mountain Climber", muscleGroup: "core", equipment: "bodyweight" },
  { name: "Dead Bug", muscleGroup: "core", equipment: "bodyweight" },
  { name: "Bird Dog", muscleGroup: "core", equipment: "bodyweight" },
  { name: "Ab Wheel Rollout", muscleGroup: "abs", equipment: "other", aliases: ["ab roller", "wheel rollout"] },
  { name: "Pallof Press", muscleGroup: "obliques", equipment: "cable", aliases: ["anti rotation press"] },
  { name: "Wood Chop", muscleGroup: "obliques", equipment: "cable", aliases: ["cable wood chop"] },
  { name: "Reverse Crunch", muscleGroup: "abs", equipment: "bodyweight" },
  { name: "Toe Touch", muscleGroup: "abs", equipment: "bodyweight", aliases: ["v up"] },
  { name: "Flutter Kick", muscleGroup: "abs", equipment: "bodyweight" },
  { name: "Hollow Body Hold", muscleGroup: "abs", equipment: "bodyweight" },
  { name: "Dragon Flag", muscleGroup: "abs", equipment: "bodyweight" },
  { name: "L Sit", muscleGroup: "abs", equipment: "bodyweight" },
  { name: "Decline Sit Up", muscleGroup: "abs", equipment: "bodyweight" },
  { name: "Machine Crunch", muscleGroup: "abs", equipment: "machine", aliases: ["ab machine"] },

  // FULL BODY / COMPOUND
  { name: "Clean", muscleGroup: "full body", equipment: "barbell", aliases: ["power clean"] },
  { name: "Clean and Jerk", muscleGroup: "full body", equipment: "barbell" },
  { name: "Snatch", muscleGroup: "full body", equipment: "barbell", aliases: ["power snatch"] },
  { name: "Thruster", muscleGroup: "full body", equipment: "barbell", aliases: ["squat to press"] },
  { name: "Dumbbell Thruster", muscleGroup: "full body", equipment: "dumbbell" },
  { name: "Burpee", muscleGroup: "full body", equipment: "bodyweight" },
  { name: "Turkish Get Up", muscleGroup: "full body", equipment: "kettlebell", aliases: ["tgu"] },
  { name: "Farmer Walk", muscleGroup: "full body", equipment: "dumbbell", aliases: ["farmer carry", "farmers walk"] },
  { name: "Sled Push", muscleGroup: "full body", equipment: "other" },
  { name: "Sled Pull", muscleGroup: "full body", equipment: "other" },
  { name: "Battle Rope", muscleGroup: "full body", equipment: "other", aliases: ["battle ropes"] },
  { name: "Box Jump", muscleGroup: "full body", equipment: "bodyweight" },
  { name: "Jump Squat", muscleGroup: "full body", equipment: "bodyweight" },

  // FOREARMS
  { name: "Wrist Curl", muscleGroup: "forearms", equipment: "barbell", aliases: ["forearm curl"] },
  { name: "Reverse Wrist Curl", muscleGroup: "forearms", equipment: "barbell" },
  { name: "Farmer Hold", muscleGroup: "forearms", equipment: "dumbbell", aliases: ["static hold"] },
  { name: "Plate Pinch", muscleGroup: "forearms", equipment: "other" },
  { name: "Dead Hang", muscleGroup: "forearms", equipment: "bodyweight" },
  { name: "Gripper", muscleGroup: "forearms", equipment: "other", aliases: ["hand gripper", "grip trainer"] },
  { name: "Wrist Roller", muscleGroup: "forearms", equipment: "other" },
  { name: "Behind Back Wrist Curl", muscleGroup: "forearms", equipment: "barbell" },

  // CARDIO
  { name: "Treadmill", muscleGroup: "cardio", equipment: "machine", aliases: ["treadmill run", "treadmill walk"] },
  { name: "Running", muscleGroup: "cardio", equipment: "bodyweight", aliases: ["run", "jogging", "jog"] },
  { name: "Walking", muscleGroup: "cardio", equipment: "bodyweight", aliases: ["walk", "brisk walk"] },
  { name: "Incline Treadmill Walk", muscleGroup: "cardio", equipment: "machine", aliases: ["incline walking", "12-3-30"] },
  { name: "Stair Climber", muscleGroup: "cardio", equipment: "machine", aliases: ["stairmaster", "stair stepper"] },
  { name: "Elliptical", muscleGroup: "cardio", equipment: "machine", aliases: ["cross trainer"] },
  { name: "Rowing Machine", muscleGroup: "cardio", equipment: "machine", aliases: ["row machine", "erg", "ergometer"] },
  { name: "Assault Bike", muscleGroup: "cardio", equipment: "machine", aliases: ["air bike", "airdyne", "echo bike"] },
  { name: "Stationary Bike", muscleGroup: "cardio", equipment: "machine", aliases: ["bike", "cycling", "spin bike"] },
  { name: "Jump Rope", muscleGroup: "cardio", equipment: "other", aliases: ["skipping", "skip rope"] },
  { name: "Swimming", muscleGroup: "cardio", equipment: "other", aliases: ["swim", "laps"] },
  { name: "Cycling", muscleGroup: "cardio", equipment: "other", aliases: ["biking", "outdoor bike"] },
  { name: "HIIT", muscleGroup: "cardio", equipment: "bodyweight", aliases: ["high intensity interval training"] },
  { name: "Sprints", muscleGroup: "cardio", equipment: "bodyweight", aliases: ["sprint intervals"] },
  { name: "Jumping Jacks", muscleGroup: "cardio", equipment: "bodyweight", aliases: ["star jumps"] },
  { name: "High Knees", muscleGroup: "cardio", equipment: "bodyweight" },
  { name: "Butt Kicks", muscleGroup: "cardio", equipment: "bodyweight" },
  { name: "Ski Erg", muscleGroup: "cardio", equipment: "machine", aliases: ["ski machine"] },
  { name: "Prowler Push", muscleGroup: "cardio", equipment: "other", aliases: ["sled push cardio"] },
  { name: "Jacob's Ladder", muscleGroup: "cardio", equipment: "machine" },
];

// Function to search exercises by name (fuzzy matching)
export function searchExercises(query: string): ExerciseTemplate[] {
  if (!query || query.length < 2) return [];

  const normalizedQuery = query.toLowerCase().trim();

  // Score each exercise based on how well it matches
  const scored = exerciseDatabase.map((exercise) => {
    const name = exercise.name.toLowerCase();
    const aliases = exercise.aliases?.map(a => a.toLowerCase()) || [];

    let score = 0;

    // Exact match on name
    if (name === normalizedQuery) {
      score = 100;
    }
    // Name starts with query
    else if (name.startsWith(normalizedQuery)) {
      score = 80;
    }
    // Name contains query as a word
    else if (name.split(' ').some(word => word.startsWith(normalizedQuery))) {
      score = 60;
    }
    // Name contains query
    else if (name.includes(normalizedQuery)) {
      score = 40;
    }
    // Check aliases
    else {
      for (const alias of aliases) {
        if (alias === normalizedQuery) {
          score = Math.max(score, 90);
        } else if (alias.startsWith(normalizedQuery)) {
          score = Math.max(score, 70);
        } else if (alias.includes(normalizedQuery)) {
          score = Math.max(score, 35);
        }
      }
    }

    // Boost common exercises
    const commonExercises = ['bench press', 'squat', 'deadlift', 'overhead press', 'barbell row'];
    if (commonExercises.some(ce => name.includes(ce))) {
      score += 5;
    }

    return { exercise, score };
  });

  // Filter and sort by score
  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8) // Return top 8 matches
    .map(({ exercise }) => exercise);
}

// Function to get suggestion for exact or near-exact match
export function getExerciseSuggestion(name: string): ExerciseTemplate | null {
  const normalizedName = name.toLowerCase().trim();

  // First try exact match
  const exactMatch = exerciseDatabase.find(
    e => e.name.toLowerCase() === normalizedName ||
         e.aliases?.some(a => a.toLowerCase() === normalizedName)
  );

  if (exactMatch) return exactMatch;

  // Try close match (for auto-fill when user selects from dropdown)
  const closeMatch = exerciseDatabase.find(
    e => e.name.toLowerCase().startsWith(normalizedName) ||
         e.aliases?.some(a => a.toLowerCase().startsWith(normalizedName))
  );

  return closeMatch || null;
}
