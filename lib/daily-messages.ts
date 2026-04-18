export const DAILY_MESSAGES = [
  {
    title: "Don't forget to drink water today!",
    body: "Staying hydrated helps regulate hormone levels and can reduce cycle symptoms. Aim for 8 glasses."
  },
  {
    title: "Prioritize your rest tonight.",
    body: "A good night's sleep is crucial for hormonal balance. Try to unwind 30 minutes before bed tonight."
  },
  {
    title: "Take a deep breath.",
    body: "Stress can impact your cycle. Take 5 minutes today just for yourself—you deserve it."
  },
  {
    title: "Move your body gently.",
    body: "Light stretching or a short walk can work wonders for menstrual cramps and boosting your mood."
  },
  {
    title: "Be kind to yourself today.",
    body: "Your body is doing an amazing job. Listen to its needs and give yourself plenty of grace."
  },
  {
    title: "Nourish your body.",
    body: "Craving something specific? It's okay to listen to your body while balancing it with nutrient-rich foods."
  },
  {
    title: "Check in with your feelings.",
    body: "Hormones can make emotions feel overwhelming. It is completely okay to feel whatever you're feeling right now."
  },
  {
    title: "Knowledge is power.",
    body: "Logging your symptoms daily helps you understand your body's unique rhythm and patterns better."
  },
  {
    title: "It is completely okay to rest.",
    body: "If your energy is low today, don't push yourself. Honoring your need for rest is a sign of strength."
  },
  {
    title: "Keep yourself cozy.",
    body: "A warm heating pad or a hot cup of herbal tea can instantly soothe pelvic tension and cramps."
  },
  {
    title: "Boost your iron intake.",
    body: "Feeling sluggish? Dark leafy greens or a small iron-rich snack can help replenish your energy levels."
  },
  {
    title: "Embrace a slow morning.",
    body: "Rushing spikes cortisol. Try giving yourself 10 extra minutes tomorrow morning to just breathe."
  },
  {
    title: "Reach out if you need to.",
    body: "You don't have to navigate everything alone. Utilize our verified doctors if you're ever feeling worried."
  },
  {
    title: "Get a little sunshine.",
    body: "Just 10 minutes of morning sunlight can boost your Vitamin D and help regulate your sleep-wake cycle."
  },
  {
    title: "Relax your shoulders.",
    body: "We hold a lot of stress in our neck and back. Drop your shoulders, stretch out, and take a deep breath."
  },
  {
    title: "Practice mindful eating.",
    body: "Take time to savor your food today. Eating slowly supports digestion and reduces bloating."
  },
  {
    title: "Give your eyes a break.",
    body: "Looking at screens late at night can disrupt your sleep cycle. Try reading a book instead tonight!"
  },
  {
    title: "Take a relaxing shower.",
    body: "A warm shower or bath can be incredibly relaxing for both your active mind and tense muscles."
  },
  {
    title: "Mind your caffeine intake.",
    body: "If you are feeling anxious or having harsh cramps, try swapping your second coffee for a soothing tea."
  },
  {
    title: "Your feelings are valid.",
    body: "Cycle-related mood swings are completely natural. Give yourself permission to feel without judgment."
  },
  {
    title: "Try some dark chocolate!",
    body: "Dark chocolate contains magnesium, which can naturally help relieve cramps and boost your mood."
  },
  {
    title: "Small steps matter.",
    body: "Building healthy habits takes time. Be proud of the small ways you took care of yourself today."
  },
  {
    title: "It is okay to say no.",
    body: "If you're feeling depleted, protect your energy. Setting gentle boundaries is an act of self-care."
  },
  {
    title: "Stay prepared.",
    body: "If your cycle is approaching soon, pack a small care kit with hygiene products in your bag just in case!"
  },
  {
    title: "One thing at a time.",
    body: "Feeling overwhelmed? Break your tasks down and just focus purely on the very next step."
  },
  {
    title: "Your body is your own.",
    body: "Learning and understanding your reproductive health empowers you to make the best choices for your life."
  },
  {
    title: "Find one small joy.",
    body: "What is one thing that made you smile today? Focusing on small wins can elevate your overall mood."
  },
  {
    title: "Stretch it out.",
    body: "A quick 5-minute yoga flow or physical stretch can help release trapped energy and alleviate tension."
  },
  {
    title: "Infuse your water.",
    body: "Not a fan of plain water? Add some lemon, mint, or cucumber to make hydrating more exciting!"
  },
  {
    title: "Listen to your body.",
    body: "If a workout feels too intense today, switch to something gentler. Your body knows what it needs."
  },
  {
    title: "Clear your space.",
    body: "A cluttered room can subconsciously increase stress. Tidy up one small area today for a mental boost."
  },
  {
    title: "Pamper your skin.",
    body: "Hormones can rapidly affect your skin. Stick to a gentle cleansing routine and don't pick at breakouts!"
  },
  {
    title: "Trust the process.",
    body: "Your cycle naturally ebbs and flows. You won't feel 100% every single day, and that is perfectly normal."
  },
  {
    title: "Balance your blood sugar.",
    body: "Pairing sweet snacks with a little bit of protein can prevent energy crashes and keep mood swings at bay."
  },
  {
    title: "You are enough.",
    body: "Just a daily reminder that you are strong, capable, resilient, and worthy of taking up space."
  }
];

/**
 * Mathematically rotates through the 35 messages based on the day of the year.
 * Using a prime multiplier (13) ensures we hit every index exactly once
 * before repeating, guaranteeing no repeat messages for an entire 35-day cycle.
 */
export function getDailyMessage() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  
  // Calculate current day of the year
  const dayOfYear = Math.floor(diff / oneDay);
  
  // Predictable, non-repeating rotating index selection
  const index = (dayOfYear * 13) % DAILY_MESSAGES.length;
  
  return DAILY_MESSAGES[index];
}
