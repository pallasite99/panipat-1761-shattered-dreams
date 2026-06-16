import React from 'react';
import { motion } from 'motion/react';

interface GardiSurrenderVisualProps {
  step: number;
}

export const GardiSurrenderVisual: React.FC<GardiSurrenderVisualProps> = ({ step }) => {
  return (
    <div className="relative w-full aspect-[4/3] bg-[#0c0806] rounded-xs border border-[#8b5e3c]/20 overflow-hidden flex flex-col justify-end shadow-inner">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 bg-radial-gradient from-amber-950/20 to-black/60 opacity-80" />

      {/* SVG Canvas containing the scene */}
      <svg
        viewBox="0 0 400 300"
        className="w-full h-full relative z-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Sky/Fort background for Step 0, tent background for other steps */}
        {step === 0 ? (
          <>
            {/* Step 0: Outside Udgir Castle */}
            {/* Distant Hills / Fort */}
            <motion.path
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              d="M 0 180 L 80 150 L 140 160 L 220 130 L 290 155 L 400 120 L 400 230 L 0 230 Z"
              fill="#221e1d"
            />
            {/* Udgir Fort Walls */}
            <motion.path
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              d="M 280 155 L 290 120 L 310 120 L 315 130 L 335 130 L 340 120 L 360 120 L 365 140 L 400 135 L 400 230 L 280 230 Z"
              fill="#181514"
            />
            {/* Fort Merlons / Details */}
            <path d="M 290 120 L 290 123" stroke="#eab308" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
            <circle cx="340" cy="155" r="1.5" fill="#ef4444" opacity="0.4" className="animate-pulse" />
            <circle cx="305" cy="140" r="1.5" fill="#f59e0b" opacity="0.4" className="animate-pulse" />

            {/* Smoke puffs from smoking basalt fortress */}
            <motion.circle
              animate={{ y: [-10, -35, -55], x: [0, 8, -5], opacity: [0.6, 0.3, 0], scale: [1, 2.5, 3.5] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeOut" }}
              cx="310"
              cy="135"
              r="4"
              fill="#52525b"
            />
            <motion.circle
              animate={{ y: [-5, -25, -45], x: [0, -6, 4], opacity: [0.5, 0.25, 0], scale: [1, 2.2, 3.2] }}
              transition={{ repeat: Infinity, duration: 3.8, delay: 1.5, ease: "easeOut" }}
              cx="335"
              cy="145"
              r="3"
              fill="#71717a"
            />

            {/* Saffron Maratha Flag atop Udgir (shattered Nizam rule) */}
            <path d="M 360 120 L 360 90" stroke="#a1a1aa" strokeWidth="1.5" />
            <motion.path
              animate={{
                d: [
                  "M 360 90 L 378 95 L 360 100 Z",
                  "M 360 90 L 375 97 L 360 102 Z",
                  "M 360 90 L 378 95 L 360 100 Z"
                ]
              }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
              fill="#f97316"
            />

            {/* Ornate Maratha Camp Tent Side Overlay */}
            <path d="M -20 80 L 150 95 L 140 230 L -20 230 Z" fill="#310f08" opacity="0.8" />
            <path d="M 152 95 L 182 145 L 142 230 Z" fill="#ea580c" opacity="0.3" />
            <path d="M -20 80 L 150 95" stroke="#facc15" strokeWidth="1.5" strokeDasharray="4 2" />
          </>
        ) : (
          <>
            {/* Step 1, 2, 3: Inside Sadashivrao Bhau's Durbar Pavilion Tent */}
            {/* Background Red/Orange Tent Wall */}
            <rect x="0" y="0" width="400" height="230" fill="#200d04" />
            
            {/* Decorative Pillars / Arches */}
            <path d="M 0 50 Q 100 25 200 50 Q 300 25 400 50" fill="none" stroke="#dc2626" strokeWidth="6" opacity="0.2" />
            <path d="M 0 50 Q 100 25 200 50 Q 300 25 400 50" fill="none" stroke="#eab308" strokeWidth="1.5" opacity="0.4" />
            
            {/* Hanging Royal Chandeliers / Lamps */}
            <line x1="100" y1="0" x2="100" y2="40" stroke="#eab308" strokeWidth="1" />
            <path d="M 92 40 L 108 40 L 100 52 Z" fill="#eab308" />
            <circle cx="100" cy="51" r="2.5" fill="#facc15" className="animate-ping" />
            
            <line x1="300" y1="0" x2="300" y2="40" stroke="#eab308" strokeWidth="1" />
            <path d="M 292 40 L 308 40 L 300 52 Z" fill="#eab308" />
            <circle cx="300" cy="51" r="2.5" fill="#facc15" className="animate-ping" />

            {/* Saffron Royal Standard Banner behind Bhau */}
            <g transform="translate(65, 35)">
              <line x1="0" y1="0" x2="0" y2="170" stroke="#b45309" strokeWidth="3.5" />
              <path d="M 0 5 L 42 15 L 0 25 L 35 34 L 0 44" fill="#ea580c" stroke="#facc15" strokeWidth="1" />
              <circle cx="20" cy="22" r="4" fill="#facc15" opacity="0.7" />
            </g>
          </>
        )}

        {/* --- GROUND FLOOR (BASE PLATE) --- */}
        <rect x="0" y="215" width="400" height="90" fill="#140e0a" />
        {step === 0 ? (
          // Stony Plain
          <path d="M 0 215 Q 120 210 240 216 Q 320 212 400 215" fill="none" stroke="#2a1f1a" strokeWidth="3" />
        ) : (
          // Royal Persian Carpet Overlay
          <>
            <rect x="15" y="215" width="370" height="8" fill="#991b1b" />
            <rect x="25" y="223" width="350" height="67" fill="#7f1d1d" />
            <path d="M 25 223 L 375 223 L 375 290 L 25 290 Z" fill="none" stroke="#d97706" strokeWidth="2.5" strokeDasharray="10 4" />
            {/* Ornamental diamond emblems on carpet */}
            <polygon points="200,245 210,255 200,265 190,255" fill="#f59e0b" opacity="0.3" />
            <polygon points="100,245 110,255 100,265 90,255" fill="#f59e0b" opacity="0.2" />
            <polygon points="300,245 310,255 300,265 290,255" fill="#f59e0b" opacity="0.2" />
          </>
        )}

        {/* --- CHARACTERS --- */}

        {/* 1. SADASHIVRAO BHAU (THE PESHWA GENERALISSIMO) - Left Side */}
        {step === 0 ? (
          // Sitting inside tent silhouette (shadowy)
          <g transform="translate(68, 140)" opacity="0.6">
            <ellipse cx="25" cy="55" rx="20" r="12" fill="#ea580c" />
            <circle cx="25" cy="30" r="10" fill="#b45309" />
            <path d="M 25 20 L 40 24 L 25 28 Z" fill="#f59e0b" /> {/* Pagri hint */}
          </g>
        ) : (
          // Rich detailed depiction of Sadashivrao Bhau
          <g transform="translate(90, 130)">
            {/* Royal Masnad (Gaddi Pillow Throne) */}
            <path d="M -30 75 Q -5 45 42 75" fill="#7f1d1d" stroke="#facc15" strokeWidth="1" />
            <ellipse cx="-25" cy="74" rx="10" ry="14" fill="#b91c1c" stroke="#facc15" strokeWidth="1" />
            <ellipse cx="38" cy="74" rx="10" ry="14" fill="#b91c1c" stroke="#facc15" strokeWidth="1" />

            {/* Bhau's Sitting Legs / Thighs */}
            <path d="M -38 85 C -25 65, 0 65, 15 85 C 30 65, 55 65, 62 85 Z" fill="#c2410c" stroke="#000" strokeWidth="0.5" />
            
            {/* Torso/Choga */}
            <motion.path
              animate={{ y: [0, -1, 0] }}
              transition={{ repeat: Infinity, duration: 4.8, ease: "easeInOut" }}
              d="M -5 32 L 30 32 L 25 80 L 0 80 Z"
              fill="#ea580c" // Saffron tunic
              stroke="#b45309"
              strokeWidth="1"
            />
            {/* Golden Sash / Kamarbandh */}
            <rect x="-1" y="60" width="28" height="6" fill="#fbbf24" rx="2" />
            {/* Necklace / Emerald String */}
            <path d="M 2 40 Q 12 52 24 40" fill="none" stroke="#10b981" strokeWidth="2.5" strokeDasharray="3 2" />

            {/* Arm - Left (Resting on pillow or accepting sword) */}
            {step === 3 ? (
              // Standing up or leaning aggressively forward to accept / hold sword
              <motion.path
                id="bhau-accept-hand"
                animate={{ rotate: [-2, 2, -2] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                d="M 22 45 L 68 40 L 66 32 L 22 40 Z"
                fill="#fdba74"
                stroke="#c2410c"
                strokeWidth="0.8"
              />
            ) : (
              // Relaxed arm resting on Masnad cylinder
              <path d="M -5 45 L -26 62 L -14 62 Z" fill="#fdba74" stroke="#c2410c" strokeWidth="0.8" />
            )}

            {/* Head & Pagri (Turban) */}
            <g transform="translate(12, 10)">
              {/* Face */}
              <circle cx="0" cy="10" r="11" fill="#fdba74" />
              {/* Royal Beard */}
              <path d="M -11 12 Q 0 25 11 12 L 8 6 L -8 6 Z" fill="#2d1e18" />
              {/* Tilak (Saffron/Sandalwood mark) */}
              <line x1="0" y1="2" x2="0" y2="9" stroke="#ea580c" strokeWidth="2" />
              <line x1="-3" y1="5" x2="3" y2="5" stroke="#facc15" strokeWidth="1" />
              
              {/* Peshwa Flat Golden Pagri (Traditional Maratha headgear) */}
              <path d="M -16 -2 Q 0 -13 16 -2 Q 22 -6 0 -18 Q -22 -6 -16 -2 Z" fill="#ea580c" stroke="#dc2626" strokeWidth="0.5" />
              {/* Golden Jewel (Sarpech) on Turban */}
              <path d="M -2 -14 L 2 -14 L 0 -22 Z" fill="#facc15" />
              <circle cx="0" cy="-21" r="1.5" fill="#ef4444" />
              <motion.path
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                d="M 0 -22 Q 12 -38 18 -32"
                fill="none"
                stroke="#fafaf9"
                strokeWidth="1.5"
              />
            </g>
          </g>
        )}


        {/* 2. IBRAHIM KHAN GARDI (THE HEROIC ARTILLERY COMMANDER) - Right/Center */}
        <g id="ibrahim-khan-gardi">
          {step === 0 ? (
            // Step 0: Standing Proud outside the tent with parchment, heavy brass cannons
            <g transform="translate(240, 110)">
              {/* Heavy Nine-Pounder Cannon background */}
              <g transform="translate(60, 45)" opacity="0.65">
                {/* Wheels */}
                <circle cx="-15" cy="40" r="18" fill="none" stroke="#eab308" strokeWidth="4" />
                <circle cx="-15" cy="40" r="18" fill="none" stroke="#78350f" strokeWidth="1.5" />
                <line x1="-15" y1="22" x2="-15" y2="58" stroke="#78350f" strokeWidth="1.5" />
                <line x1="-33" y1="40" x2="3" y2="40" stroke="#78350f" strokeWidth="1.5" />
                {/* Cannon Barrel */}
                <path d="M -35 25 L 18 20 L 20 30 L -35 31 Z" fill="#ca8a04" stroke="#854d0e" strokeWidth="1" />
                <rect x="-42" y="26" width="8" height="5" fill="#ca8a04" />
              </g>

              {/* Tunic & European French Coat (Navy Blue) */}
              <motion.path
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.9 }}
                d="M -15 45 L 14 45 L 10 100 L -10 100 Z"
                fill="#1e3a8a" // Royal Blue French Military Coat
                stroke="#172554"
                strokeWidth="1"
              />
              {/* Golden epaulets */}
              <rect x="-17" y="43" width="7" height="3.5" fill="#fbbf24" />
              <rect x="10" y="43" width="7" height="3.5" fill="#fbbf24" />
              {/* White Crossbelts */}
              <line x1="-14" y1="45" x2="10" y2="100" stroke="#fafaf9" strokeWidth="2.5" />
              <line x1="10" y1="45" x2="-10" y2="100" stroke="#fafaf9" strokeWidth="2.5" />

              {/* Legs in White breeches and black boots */}
              <rect x="-10" y="100" width="7" height="12" fill="#fafaf9" />
              <rect x="3" y="100" width="7" height="12" fill="#fafaf9" />
              <rect x="-11" y="112" width="9" height="10" fill="#18181b" rx="1.5" />
              <rect x="2" y="112" width="9" height="10" fill="#18181b" rx="1.5" />

              {/* Hand holding rolled parchment */}
              <motion.g
                animate={{ rotate: [-2, 3, -2] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                transform="origin-top-left"
              >
                {/* Arm */}
                <path d="M -15 48 L -32 64 L -28 70 L -12 54 Z" fill="#1e3a8a" />
                {/* Hand */}
                <circle cx="-32" cy="69" r="4.5" fill="#e0a96d" />
                {/* Rolled Truce Parchment */}
                <rect x="-42" y="65" width="22" height="6.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" rx="1" />
                <line x1="-24" y1="65" x2="-24" y2="71.5" stroke="#ef4444" strokeWidth="1" />
              </motion.g>
              <g transform="translate(0, 20)">
                <circle cx="0" cy="11" r="10" fill="#e0a96d" />
                <path d="M -7 13 Q 0 16 7 13" fill="none" stroke="#2a1f1a" strokeWidth="1.5" />

                {/* French Officer Tri-Corn or Shako Hat */}
                <polygon points="-14,-1 -4,-18 4,-18 14,-1" fill="#18181b" stroke="#ca8a04" strokeWidth="1" />
                <circle cx="0" cy="-10" r="3" fill="#da1e28" /> {/* French Cocarde cockade */}
                <circle cx="0" cy="-10" r="1" fill="#fafaf9" />
                {/* Golden brass plate edge */}
                <path d="M -14 -1 L 14 -1" stroke="#eab308" strokeWidth="1.5" />
              </g>
            </g>
          ) : step === 1 ? (
            // Step 1: Kneeling inside, offering his French officer's rapier sword
            <g transform="translate(235, 140)">
              {/* Kneeling Body Coat */}
              <motion.path
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                d="M -15 32 L 14 32 L 20 60 L -10 80 Z"
                fill="#1e3a8a"
                stroke="#172554"
                strokeWidth="1"
              />
              {/* Epaulets */}
              <rect x="-17" y="30" width="7" height="3" fill="#fbbf24" />
              <rect x="10" y="30" width="7" height="3" fill="#fbbf24" />
              
              {/* Crossbelts */}
              <line x1="-14" y1="32" x2="14" y2="72" stroke="#fafaf9" strokeWidth="2" opacity="0.9" />

              {/* Kneeling Legs (bench position) */}
              <path d="M -10 75 Q 12 75 25 80 L 15 95 L -20 95 Z" fill="#fafaf9" stroke="#172554" strokeWidth="0.5" />
              <path d="M 23 80 L 35 94 L 28 97 L 18 83 Z" fill="#18181b" /> {/* Boots */}

              {/* Presenting Arms (Both hands stretched out holding sword) */}
              <g>
                <path d="M -14 38 L -55 42 L -54 48 L -14 43 Z" fill="#1e3a8a" />
                <path d="M 12 38 L -48 45 L -47 51 L 12 43 Z" fill="#1e3a8a" opacity="0.8" />
                
                {/* Silver Rapier / Sword presented flat */}
                <motion.g
                  animate={{ y: [-1, 1, -1] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                >
                  {/* Sword Blade */}
                  <line x1="-120" y1="43" x2="-48" y2="44" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                  <line x1="-120" y1="44" x2="-48" y2="44" stroke="#ffffff" strokeWidth="0.8" />
                  {/* Elegant gold cup hilt */}
                  <circle cx="-46" cy="44" r="5" fill="#facc15" stroke="#ca8a04" strokeWidth="0.5" />
                  <line x1="-48" y1="36" x2="-48" y2="52" stroke="#facc15" strokeWidth="1.5" />
                  {/* Handle grip */}
                  <rect x="-42" y="42" width="10" height="3" fill="#78350f" />
                  <circle cx="-31" cy="43.5" r="2" fill="#facc15" />
                </motion.g>

                {/* Hand circles holding */}
                <circle cx="-50" cy="46" r="4" fill="#e0a96d" />
                <circle cx="-44" cy="48" r="4" fill="#e0a96d" />
              </g>

              {/* Head / Hat kneeling view */}
              <g transform="translate(0, 10)">
                <circle cx="0" cy="11" r="10" fill="#e0a96d" />
                <path d="M -6 13 Q 0 16 6 13" fill="none" stroke="#2a1f1a" strokeWidth="1.5" />
                <polygon points="-13,-3 -3,-20 5,-20 13,-3" fill="#18181b" stroke="#ca8a04" strokeWidth="0.8" />
                <path d="M -13 -3 L 13 -3" stroke="#eab308" strokeWidth="1" />
              </g>
            </g>
          ) : step === 2 ? (
            // Step 2: Gardi remains kneeling in submission as Malharrao shouts
            <g transform="translate(260, 145)" opacity="0.85">
              <path d="M -12 28 L 12 28 L 15 54 L -8 72 Z" fill="#1e3a8a" stroke="#172554" strokeWidth="0.8" />
              <path d="M -8 70 Q 10 70 20 75 L 12 87 L -15 87 Z" fill="#fafaf9" />
              <circle cx="-32" cy="40" r="3.5" fill="#e0a96d" />
              
              {/* Sword lying on floor carpet tray between them */}
              <g transform="translate(-105, 68)">
                <line x1="-45" y1="0" x2="30" y2="0" stroke="#94a3b8" strokeWidth="1.8" />
                <circle cx="31" cy="0" r="4.5" fill="#eab308" />
                <line x1="30" y1="-5" x2="30" y2="5" stroke="#eab308" strokeWidth="1.2" />
              </g>

              {/* Head kneeling (looking slightly down) */}
              <g transform="translate(0, 8)" rotate="8">
                <circle cx="0" cy="11" r="9.5" fill="#e0a96d" />
                <polygon points="-12,-3 -3,-18 5,-18 12,-3" fill="#18181b" />
              </g>
            </g>
          ) : (
            // Step 3: Commissioned! Stand side-by-side with Bhau, wearing gold-plate breast armor
            <motion.g
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              transform="translate(230, 110)"
            >
              {/* Stand proudly upright */}
              <path d="M -15 45 L 14 45 L 11 100 L -9 100 Z" fill="#1e3a8a" stroke="#172554" strokeWidth="1" />
              {/* Golden Symmetrical Breastplate (Commissioned by Peshwa) */}
              <path d="M -11 48 L 10 48 L 7 76 L -7 76 Z" fill="#daaf38" stroke="#ca8a04" strokeWidth="1" />
              <circle cx="0" cy="56" r="3" fill="#ea580c" />
              <line x1="-11" y1="48" x2="10" y2="48" stroke="#fafaf9" strokeWidth="1" />

              <g transform="translate(6, 43)">
                <rect x="-18" y="0" width="6" height="3" fill="#fbbf24" />
                <rect x="6" y="0" width="6" height="3" fill="#fbbf24" />
              </g>

              {/* White pants & boots */}
              <rect x="-9" y="100" width="7" height="12" fill="#fafaf9" />
              <rect x="3" y="100" width="7" height="12" fill="#fafaf9" />
              <rect x="-10" y="112" width="9" height="10" fill="#121214" rx="1.5" />
              <rect x="2" y="112" width="9" height="10" fill="#121214" rx="1.5" />

              {/* Arm rest - left (Holding golden commission scroller) */}
              <g>
                <path d="M -13 47 L -28 65 L -24 70 L -10 52 Z" fill="#1e3a8a" />
                <circle cx="-28" cy="70" r="4" fill="#e0a96d" />
                {/* Saffron Peshwa seal decree scroll */}
                <rect x="-35" y="65" width="15" height="18" fill="#ff7849" stroke="#ea580c" strokeWidth="1" rx="1" />
                <circle cx="-27.5" cy="74" r="2.5" fill="#facc15" />
              </g>

              {/* Head & Tri-corn (looking proudly forward) */}
              <g transform="translate(0, 20)">
                <circle cx="0" cy="11" r="10" fill="#e0a96d" />
                <path d="M -6 14 Q 0 16 6 14" fill="none" stroke="#2a1f1a" strokeWidth="1.5" />
                <polygon points="-14,-1 -4,-18 4,-18 14,-1" fill="#18181b" stroke="#ca8a04" strokeWidth="1" />
                <path d="M -14 -1 L 14 -1" stroke="#eab308" strokeWidth="1.5" />
              </g>
            </motion.g>
          )}
        </g>


        {/* 3. SUBEHDAR MALHAR RAO HOLKAR (VETERAN CAVALRY CHIEF) - Enters on Step 2 & 3 */}
        {(step === 2 || step === 3) && (
          <motion.g
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 60 }}
            transform={step === 2 ? "translate(182, 122)" : "translate(315, 125)"}
            id="malhar-rao-holkar"
          >
            {/* Body Tunic (Vibrant Crimson Red / Holkar clan color) */}
            <path d="M -12 36 L 14 36 L 9 90 L -9 90 Z" fill="#b91c1c" stroke="#991b1b" strokeWidth="1" />
            
            {/* Metal Mail Armor Overlay */}
            <path d="M -9 39 L 11 39 L 6 70 L -6 70 Z" fill="#475569" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3 2" />

            {/* Dhoti / Pants & Warrior armor boots */}
            <rect x="-8" y="90" width="6" height="15" fill="#eab308" />
            <rect x="2" y="90" width="6" height="15" fill="#eab308" />
            <rect x="-9" y="105" width="8" height="8" fill="#451a03" rx="1.5" />
            <rect x="1" y="105" width="8" height="8" fill="#451a03" rx="1.5" />

            {/* Holkar's Arm - pointing aggressively in Step 2, resting on spear in Step 3 */}
            {step === 2 ? (
              // Pointing aggressively down at the Gardi or sword!
              <motion.g
                animate={{ rotate: [-4, 2, -4] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                transform="origin-top-left"
              >
                {/* Arm */}
                <path d="M -11 40 L -45 32 L -43 38 L -11 46 Z" fill="#b91c1c" />
                {/* Pointing Hand */}
                <circle cx="-47" cy="34" r="4.5" fill="#e0a96d" />
                {/* Long stick pointer hand line */}
                <line x1="-47" y1="34" x2="-62" y2="31" stroke="#e0a96d" strokeWidth="1.5" strokeLinecap="round" />
              </motion.g>
            ) : (
              // Step 3: Holding massive warrior spear upright proudly
              <g>
                <path d="M 12 40 L 26 58 L 20 62 L 8 44 Z" fill="#b91c1c" />
                <circle cx="24" cy="60" r="4" fill="#e0a96d" />
                {/* Giant cavalry spear */}
                <line x1="24" y1="-30" x2="24" y2="105" stroke="#78350f" strokeWidth="2.5" />
                {/* Silver Spear tip */}
                <polygon points="21,-30 24,-45 27,-30" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="0.5" />
                {/* Saffron flag tassel on spear */}
                <polygon points="24,-24 38,-20 24,-16" fill="#ea580c" />
              </g>
            )}

            {/* Head & Peshwa Pagri with Maratha Saffron trim */}
            <g transform="translate(1, 12)">
              <circle cx="0" cy="11" r="10.5" fill="#e0a96d" />
              {/* Large, wise warrior white mustache */}
              <path d="M -9 11 Q 0 16 9 11 Q 5 18 -5 18 Z" fill="#f5f5f5" />
              {/* Fierce tribal tilak mark */}
              <circle cx="0" cy="5" r="2.5" fill="#ea580c" />

              {/* Warrior Pagri Turban */}
              <path d="M -15 -2 Q 0 -11 15 -2 Q 18 -5 0 -15 Q -18 -5 -15 -2 Z" fill="#991b1b" stroke="#eab308" strokeWidth="0.8" />
              <path d="M -10 -8 Q 0 -13 10 -8" stroke="#eab308" strokeWidth="1.5" />
            </g>
          </motion.g>
        )}

        {/* --- LIGHTING / FOREGROUND VIGNETTE --- */}
        {step === 0 ? (
          // Battlefield ambiance (dark ashes/embers blowing in forefront)
          <>
            <motion.circle
              animate={{ x: [400, -20], y: [260, 240], opacity: [0, 0.6, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
              r="2"
              fill="#fb7185"
            />
            <motion.circle
              animate={{ x: [380, -40], y: [240, 210], opacity: [0, 0.4, 0] }}
              transition={{ repeat: Infinity, duration: 8, delay: 2, ease: "linear" }}
              r="1.5"
              fill="#fcd34d"
            />
          </>
        ) : (
          // Durbar royal lamp rays falling down
          <>
            <polygon points="100,52 60,215 140,215" fill="url(#lamp-ray)" opacity="0.1" pointerEvents="none" />
            <polygon points="300,52 260,215 340,215" fill="url(#lamp-ray)" opacity="0.1" pointerEvents="none" />
          </>
        )}

        {/* --- REUSABLE GRADIENTS --- */}
        <defs>
          <linearGradient id="lamp-ray" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Dynamic Subtitles overlaying bottom of the stage */}
      <div className="absolute top-3 left-3 bg-stone-950/85 border border-[#8b5e3c]/35 px-2.5 py-1 rounded-xs backdrop-blur-xs">
        <span className="text-[9px] font-mono tracking-wider block font-bold text-saffron">
          {step === 0 && "STAGE I: THE TRUCE OFFER"}
          {step === 1 && "STAGE II: KNEELING surrenDER"}
          {step === 2 && "STAGE III: COALITION RIFT"}
          {step === 3 && "STAGE IV: CONTRACT RATIFIED"}
        </span>
      </div>

      <div className="absolute bottom-3 right-3 bg-stone-950/85 px-2 py-0.5 rounded-xs text-[8px] font-mono text-stone-500 uppercase">
        Click 'Continue' below to advance dialogue
      </div>
    </div>
  );
};
