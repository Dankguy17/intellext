import { Question } from '../types/Quiz';

// Base types for generator parameters and results
interface GeneratorResult {
  question: string;
  questionType: 'multiple_choice' | 'free_response' | 'true_false';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

interface BaseGeneratorParams {
  difficulty?: 'easy' | 'medium' | 'hard';
  unitSystem?: 'SI' | 'imperial';
  questionType?: 'multiple_choice' | 'free_response' | 'true_false';
}

// Helper functions
const randomInRange = (min: number, max: number): number => {
  return Number((Math.random() * (max - min) + min).toFixed(3));
};

const formatNumber = (num: number, precision: number = 2): string => {
  return Number(num.toFixed(precision)).toString();
};

// Generate random variations of a number for multiple choice options
const generateOptions = (correctValue: number, count: number = 4): string[] => {
  const variations = [1]; // Start with correct answer (multiplier of 1)
  while (variations.length < count) {
    // Generate multipliers between 0.7 and 1.3, but not too close to existing ones
    const multiplier = randomInRange(0.7, 1.3);
    if (!variations.some(v => Math.abs(v - multiplier) < 0.1)) {
      variations.push(multiplier);
    }
  }
  const options = variations
    .map(v => formatNumber(correctValue * v))
    .sort(() => Math.random() - 0.5);
  
  // Ensure the correct answer is included in the options
  const correctStr = formatNumber(correctValue);
  if (!options.includes(correctStr)) {
    options[Math.floor(Math.random() * options.length)] = correctStr;
  }
  
  return options;
};

// Format question based on type
const formatQuestion = (
  baseQuestion: string,
  correctAnswer: string | number,
  questionType: 'multiple_choice' | 'free_response' | 'true_false',
  options?: string[]
): GeneratorResult => {
  switch (questionType) {
    case 'multiple_choice':
      return {
        question: `${baseQuestion}\nSelect the correct answer:`,
        questionType,
        options: options || generateOptions(Number(correctAnswer)),
        correctAnswer: correctAnswer.toString(),
      };
    case 'free_response':
      return {
        question: `${baseQuestion}\nProvide your answer with appropriate units:`,
        questionType,
        correctAnswer: correctAnswer.toString(),
      };
    case 'true_false':
      const isTrueStatement = Math.random() < 0.5;
      const modifiedAnswer = isTrueStatement ? correctAnswer : (Number(correctAnswer) * randomInRange(1.2, 1.5));
      return {
        question: `${baseQuestion}\nIs this statement true or false: The answer is ${modifiedAnswer}`,
        questionType,
        correctAnswer: isTrueStatement ? 'True' : 'False',
      };
  }
};

// Snell's Law Generator
interface SnellsLawParams extends BaseGeneratorParams {
  n1Min?: number;
  n1Max?: number;
  n2Min?: number;
  n2Max?: number;
  theta1Min?: number;
  theta1Max?: number;
}

const generateSnellsLawQuestion = (params: SnellsLawParams): GeneratorResult => {
  const {
    n1Min = 1.0,
    n1Max = 1.5,
    n2Min = 1.3,
    n2Max = 2.0,
    theta1Min = 15,
    theta1Max = 60,
    difficulty = 'medium',
    questionType = 'multiple_choice',
  } = params;

  const n1 = randomInRange(n1Min, n1Max);
  const n2 = randomInRange(n2Min, n2Max);
  const theta1 = randomInRange(theta1Min, theta1Max);

  const theta2 = Math.asin((n1 * Math.sin(theta1 * Math.PI / 180)) / n2) * 180 / Math.PI;

  const question = `A light ray travels from a medium with refractive index n₁ = ${formatNumber(n1)} to another medium with n₂ = ${formatNumber(n2)}. If the angle of incidence is ${formatNumber(theta1)}°, what is the angle of refraction (in degrees)?`;

  return formatQuestion(question, theta2, questionType);
};

// Projectile Motion Generator
interface ProjectileMotionParams extends BaseGeneratorParams {
  velocityMin?: number;
  velocityMax?: number;
  angleMin?: number;
  angleMax?: number;
  heightMin?: number;
  heightMax?: number;
}

const generateProjectileMotionQuestion = (params: ProjectileMotionParams): GeneratorResult => {
  const {
    velocityMin = 10,
    velocityMax = 30,
    angleMin = 20,
    angleMax = 70,
    heightMin = 0,
    heightMax = 10,
    difficulty = 'medium',
    questionType = 'multiple_choice',
  } = params;

  const v0 = randomInRange(velocityMin, velocityMax);
  const theta = randomInRange(angleMin, angleMax);
  const h0 = randomInRange(heightMin, heightMax);
  
  const g = 9.81;
  const theta_rad = theta * Math.PI / 180;
  
  // Calculate maximum height
  const v0y = v0 * Math.sin(theta_rad);
  const hmax = h0 + (v0y * v0y) / (2 * g);
  
  const question = `A projectile is launched from a height of ${formatNumber(h0)} meters with an initial velocity of ${formatNumber(v0)} m/s at an angle of ${formatNumber(theta)}° above the horizontal. What is the maximum height reached by the projectile (in meters)?`;

  return formatQuestion(question, hmax, questionType);
};

// Circular Motion Generator
interface CircularMotionParams extends BaseGeneratorParams {
  radiusMin?: number;
  radiusMax?: number;
  velocityMin?: number;
  velocityMax?: number;
}

const generateCircularMotionQuestion = (params: CircularMotionParams): GeneratorResult => {
  const {
    radiusMin = 1,
    radiusMax = 10,
    velocityMin = 5,
    velocityMax = 20,
    difficulty = 'medium',
    questionType = 'multiple_choice',
  } = params;

  const radius = randomInRange(radiusMin, radiusMax);
  const velocity = randomInRange(velocityMin, velocityMax);
  
  const acceleration = (velocity * velocity) / radius;
  
  const question = `An object moves in a circular path with radius ${formatNumber(radius)} meters at a constant speed of ${formatNumber(velocity)} m/s. What is the centripetal acceleration of the object (in m/s²)?`;

  return formatQuestion(question, acceleration, questionType);
};

// Work and Energy Generator
interface WorkEnergyParams extends BaseGeneratorParams {
  massMin?: number;
  massMax?: number;
  heightMin?: number;
  heightMax?: number;
}

const generateWorkEnergyQuestion = (params: WorkEnergyParams): GeneratorResult => {
  const {
    massMin = 1,
    massMax = 10,
    heightMin = 2,
    heightMax = 15,
    difficulty = 'medium',
    questionType = 'multiple_choice',
  } = params;

  const mass = randomInRange(massMin, massMax);
  const height = randomInRange(heightMin, heightMax);
  
  const g = 9.81;
  const energy = mass * g * height;
  
  const question = `A ${formatNumber(mass)} kg object is lifted to a height of ${formatNumber(height)} meters. How much gravitational potential energy does it gain (in Joules)?`;

  return formatQuestion(question, energy, questionType);
};

// Newton's Second Law Generator
interface NewtonsLawParams extends BaseGeneratorParams {
  massMin?: number;
  massMax?: number;
  forceMin?: number;
  forceMax?: number;
  frictionCoefMin?: number;
  frictionCoefMax?: number;
}

const generateNewtonsLawQuestion = (params: NewtonsLawParams): GeneratorResult => {
  const {
    massMin = 1,
    massMax = 20,
    forceMin = 10,
    forceMax = 100,
    frictionCoefMin = 0.1,
    frictionCoefMax = 0.5,
    difficulty = 'medium',
    questionType = 'multiple_choice',
  } = params;

  const mass = randomInRange(massMin, massMax);
  const appliedForce = randomInRange(forceMin, forceMax);
  const frictionCoef = randomInRange(frictionCoefMin, frictionCoefMax);
  
  const g = 9.81;
  const frictionForce = frictionCoef * mass * g;
  const netForce = appliedForce - frictionForce;
  const acceleration = netForce / mass;
  
  const question = `A ${formatNumber(mass)} kg block is pushed with a force of ${formatNumber(appliedForce)} N across a surface with a coefficient of friction μ = ${formatNumber(frictionCoef)}. What is the block's acceleration (in m/s²)?`;

  return formatQuestion(question, acceleration, questionType);
};

// Simple Harmonic Motion Generator
interface SHMParams extends BaseGeneratorParams {
  springConstantMin?: number;
  springConstantMax?: number;
  massMin?: number;
  massMax?: number;
  amplitudeMin?: number;
  amplitudeMax?: number;
}

const generateSHMQuestion = (params: SHMParams): GeneratorResult => {
  const {
    springConstantMin = 100,
    springConstantMax = 500,
    massMin = 0.1,
    massMax = 2.0,
    amplitudeMin = 0.05,
    amplitudeMax = 0.2,
    difficulty = 'medium',
    questionType = 'multiple_choice',
  } = params;

  const k = randomInRange(springConstantMin, springConstantMax);
  const m = randomInRange(massMin, massMax);
  const A = randomInRange(amplitudeMin, amplitudeMax);
  
  const omega = Math.sqrt(k/m);
  const period = 2 * Math.PI * Math.sqrt(m/k);
  
  const question = `A mass of ${formatNumber(m)} kg is attached to a spring with spring constant k = ${formatNumber(k)} N/m and pulled to a displacement of ${formatNumber(A)} m. What is the period of oscillation (in seconds)?`;

  return formatQuestion(question, period, questionType);
};

// Doppler Effect Generator
interface DopplerParams extends BaseGeneratorParams {
  sourceFreqMin?: number;
  sourceFreqMax?: number;
  sourceSpeedMin?: number;
  sourceSpeedMax?: number;
  observerSpeedMin?: number;
  observerSpeedMax?: number;
}

const generateDopplerQuestion = (params: DopplerParams): GeneratorResult => {
  const {
    sourceFreqMin = 200,
    sourceFreqMax = 1000,
    sourceSpeedMin = 5,
    sourceSpeedMax = 30,
    observerSpeedMin = 0,
    observerSpeedMax = 20,
    difficulty = 'medium',
    questionType = 'multiple_choice',
  } = params;

  const f0 = randomInRange(sourceFreqMin, sourceFreqMax);
  const vs = randomInRange(sourceSpeedMin, sourceSpeedMax);
  const vo = randomInRange(observerSpeedMin, observerSpeedMax);
  
  const v = 343; // speed of sound in m/s
  const observedFreq = f0 * ((v + vo) / (v - vs));
  
  const question = `A sound source emitting waves at ${formatNumber(f0)} Hz moves away at ${formatNumber(vs)} m/s while an observer moves toward the source at ${formatNumber(vo)} m/s. What frequency does the observer hear (in Hz)?`;

  return formatQuestion(question, observedFreq, questionType);
};

// Electric Field Generator
interface ElectricFieldParams extends BaseGeneratorParams {
  charge1Min?: number;
  charge1Max?: number;
  charge2Min?: number;
  charge2Max?: number;
  distanceMin?: number;
  distanceMax?: number;
}

const generateElectricFieldQuestion = (params: ElectricFieldParams): GeneratorResult => {
  const {
    charge1Min = 1e-6,
    charge1Max = 1e-5,
    charge2Min = 1e-6,
    charge2Max = 1e-5,
    distanceMin = 0.1,
    distanceMax = 1.0,
    difficulty = 'medium',
    questionType = 'multiple_choice',
  } = params;

  const q1 = randomInRange(charge1Min, charge1Max);
  const q2 = randomInRange(charge2Min, charge2Max);
  const r = randomInRange(distanceMin, distanceMax);
  
  const k = 8.99e9; // Coulomb's constant
  const force = k * Math.abs(q1 * q2) / (r * r);
  
  const question = `Two point charges of ${formatNumber(q1 * 1e6)} μC and ${formatNumber(q2 * 1e6)} μC are separated by ${formatNumber(r)} m. What is the magnitude of the electric force between them (in N)?`;

  return formatQuestion(question, force, questionType);
};

// Ideal Gas Law Generator
interface IdealGasParams extends BaseGeneratorParams {
  volumeMin?: number;
  volumeMax?: number;
  pressureMin?: number;
  pressureMax?: number;
  temperatureMin?: number;
  temperatureMax?: number;
}

const generateIdealGasQuestion = (params: IdealGasParams): GeneratorResult => {
  const {
    volumeMin = 0.001,
    volumeMax = 0.01,
    pressureMin = 1e5,
    pressureMax = 5e5,
    temperatureMin = 273,
    temperatureMax = 373,
    difficulty = 'medium',
    questionType = 'multiple_choice',
  } = params;

  const V1 = randomInRange(volumeMin, volumeMax);
  const P1 = randomInRange(pressureMin, pressureMax);
  const T1 = randomInRange(temperatureMin, temperatureMax);
  const T2 = randomInRange(temperatureMin, temperatureMax);
  
  // Using P1V1/T1 = P2V2/T2
  const V2 = (P1 * V1 * T2) / (T1 * P1);
  
  const question = `A gas occupies ${formatNumber(V1 * 1000)} L at ${formatNumber(P1 / 1000)} kPa and ${formatNumber(T1 - 273)}°C. If the temperature changes to ${formatNumber(T2 - 273)}°C at constant pressure, what is the new volume (in L)?`;

  return formatQuestion(question, V2 * 1000, questionType);
};

// Momentum and Collision Generator
interface CollisionParams extends BaseGeneratorParams {
  mass1Min?: number;
  mass1Max?: number;
  mass2Min?: number;
  mass2Max?: number;
  velocity1Min?: number;
  velocity1Max?: number;
}

const generateCollisionQuestion = (params: CollisionParams): GeneratorResult => {
  const {
    mass1Min = 1,
    mass1Max = 10,
    mass2Min = 1,
    mass2Max = 10,
    velocity1Min = 2,
    velocity1Max = 15,
    difficulty = 'medium',
    questionType = 'multiple_choice',
  } = params;

  const m1 = randomInRange(mass1Min, mass1Max);
  const m2 = randomInRange(mass2Min, mass2Max);
  const v1i = randomInRange(velocity1Min, velocity1Max);
  
  // Perfectly elastic collision
  const v1f = ((m1 - m2) * v1i) / (m1 + m2);
  const v2f = (2 * m1 * v1i) / (m1 + m2);

  const question = `A ${formatNumber(m1)} kg object moving at ${formatNumber(v1i)} m/s collides elastically with a stationary ${formatNumber(m2)} kg object. What is the final velocity of the second object (in m/s)?`;

  return formatQuestion(question, v2f, questionType);
};

// Wave Properties Generator
interface WaveParams extends BaseGeneratorParams {
  frequencyMin?: number;
  frequencyMax?: number;
  wavelengthMin?: number;
  wavelengthMax?: number;
}

const generateWaveQuestion = (params: WaveParams): GeneratorResult => {
  const {
    frequencyMin = 100,
    frequencyMax = 1000,
    wavelengthMin = 0.1,
    wavelengthMax = 1.0,
    difficulty = 'medium',
    questionType = 'multiple_choice',
  } = params;

  const frequency = randomInRange(frequencyMin, frequencyMax);
  const wavelength = randomInRange(wavelengthMin, wavelengthMax);
  
  const velocity = frequency * wavelength;

  const question = `A wave has a frequency of ${formatNumber(frequency)} Hz and a wavelength of ${formatNumber(wavelength)} m. What is the wave's velocity (in m/s)?`;

  return formatQuestion(question, velocity, questionType);
};

// Rotational Motion Generator
interface RotationalParams extends BaseGeneratorParams {
  radiusMin?: number;
  radiusMax?: number;
  angularVelocityMin?: number;
  angularVelocityMax?: number;
  massMin?: number;
  massMax?: number;
}

const generateRotationalQuestion = (params: RotationalParams): GeneratorResult => {
  const {
    radiusMin = 0.1,
    radiusMax = 1.0,
    angularVelocityMin = 1,
    angularVelocityMax = 10,
    massMin = 0.1,
    massMax = 2.0,
    difficulty = 'medium',
    questionType = 'multiple_choice',
  } = params;

  const radius = randomInRange(radiusMin, radiusMax);
  const omega = randomInRange(angularVelocityMin, angularVelocityMax);
  const mass = randomInRange(massMin, massMax);
  
  const I = 0.5 * mass * radius * radius; // Moment of inertia for a disk
  const L = I * omega; // Angular momentum

  const question = `A disk of mass ${formatNumber(mass)} kg and radius ${formatNumber(radius)} m rotates with an angular velocity of ${formatNumber(omega)} rad/s. What is its angular momentum (in kg⋅m²/s)?`;

  return formatQuestion(question, L, questionType);
};

// Registry of all available generators
export const generators: Record<string, {
  generate: (params: any) => GeneratorResult;
  defaultParams: any;
  name: string;
  description: string;
}> = {
  'snells-law': {
    generate: generateSnellsLawQuestion,
    defaultParams: {
      n1Min: 1.0,
      n1Max: 1.5,
      n2Min: 1.3,
      n2Max: 2.0,
      theta1Min: 15,
      theta1Max: 60,
    },
    name: "Snell's Law",
    description: "Generate questions about light refraction and Snell's Law",
  },
  'projectile-motion': {
    generate: generateProjectileMotionQuestion,
    defaultParams: {
      velocityMin: 10,
      velocityMax: 30,
      angleMin: 20,
      angleMax: 70,
      heightMin: 0,
      heightMax: 10,
    },
    name: "Projectile Motion",
    description: "Generate questions about projectile motion and trajectories",
  },
  'circular-motion': {
    generate: generateCircularMotionQuestion,
    defaultParams: {
      radiusMin: 1,
      radiusMax: 10,
      velocityMin: 5,
      velocityMax: 20,
    },
    name: "Circular Motion",
    description: "Generate questions about circular motion and centripetal acceleration",
  },
  'work-energy': {
    generate: generateWorkEnergyQuestion,
    defaultParams: {
      massMin: 1,
      massMax: 10,
      heightMin: 2,
      heightMax: 15,
    },
    name: "Work and Energy",
    description: "Generate questions about work, energy, and conservation principles",
  },
  'newtons-law': {
    generate: generateNewtonsLawQuestion,
    defaultParams: {
      massMin: 1,
      massMax: 20,
      forceMin: 10,
      forceMax: 100,
      frictionCoefMin: 0.1,
      frictionCoefMax: 0.5,
    },
    name: "Newton's Second Law",
    description: "Generate questions about forces, mass, and acceleration",
  },
  'simple-harmonic': {
    generate: generateSHMQuestion,
    defaultParams: {
      springConstantMin: 100,
      springConstantMax: 500,
      massMin: 0.1,
      massMax: 2.0,
      amplitudeMin: 0.05,
      amplitudeMax: 0.2,
    },
    name: "Simple Harmonic Motion",
    description: "Generate questions about springs and oscillatory motion",
  },
  'doppler-effect': {
    generate: generateDopplerQuestion,
    defaultParams: {
      sourceFreqMin: 200,
      sourceFreqMax: 1000,
      sourceSpeedMin: 5,
      sourceSpeedMax: 30,
      observerSpeedMin: 0,
      observerSpeedMax: 20,
    },
    name: "Doppler Effect",
    description: "Generate questions about wave frequency changes due to relative motion",
  },
  'electric-field': {
    generate: generateElectricFieldQuestion,
    defaultParams: {
      charge1Min: 1e-6,
      charge1Max: 1e-5,
      charge2Min: 1e-6,
      charge2Max: 1e-5,
      distanceMin: 0.1,
      distanceMax: 1.0,
    },
    name: "Electric Forces",
    description: "Generate questions about electric forces between charges",
  },
  'ideal-gas': {
    generate: generateIdealGasQuestion,
    defaultParams: {
      volumeMin: 0.001,
      volumeMax: 0.01,
      pressureMin: 1e5,
      pressureMax: 5e5,
      temperatureMin: 273,
      temperatureMax: 373,
    },
    name: "Ideal Gas Law",
    description: "Generate questions about pressure, volume, and temperature relationships in gases",
  },
  'collision': {
    generate: generateCollisionQuestion,
    defaultParams: {
      mass1Min: 1,
      mass1Max: 10,
      mass2Min: 1,
      mass2Max: 10,
      velocity1Min: 2,
      velocity1Max: 15,
    },
    name: "Momentum and Collisions",
    description: "Generate questions about momentum, collisions, and conservation principles",
  },
  'wave': {
    generate: generateWaveQuestion,
    defaultParams: {
      frequencyMin: 100,
      frequencyMax: 1000,
      wavelengthMin: 0.1,
      wavelengthMax: 1.0,
    },
    name: "Wave Properties",
    description: "Generate questions about wave properties and behavior",
  },
  'rotational-motion': {
    generate: generateRotationalQuestion,
    defaultParams: {
      radiusMin: 0.1,
      radiusMax: 1.0,
      angularVelocityMin: 1,
      angularVelocityMax: 10,
      massMin: 0.1,
      massMax: 2.0,
    },
    name: "Rotational Motion",
    description: "Generate questions about rotational kinematics and dynamics",
  },
};

// Function to generate a question using a specified generator
export const generateQuestion = (
  generatorName: string,
  params: Record<string, any>
): Question => {
  const generator = generators[generatorName];
  if (!generator) {
    throw new Error(`Generator '${generatorName}' not found`);
  }

  const questionType = params.questionType || 'multiple_choice';
  const result = generator.generate({ ...generator.defaultParams, ...params });
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    type: 'dynamic',
    questionType: result.questionType,
    question: result.question,
    options: result.options,
    correctAnswer: result.correctAnswer,
    generator: generatorName,
    generatorParams: params,
    explanation: result.explanation
  };
};
