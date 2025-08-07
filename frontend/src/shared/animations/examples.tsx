/**
 * 🎭 Animation Examples
 *
 * Examples of how to use the animation system components and hooks.
 * These examples demonstrate best practices and common patterns.
 */

import {
  FadeIn,
  MotionButton,
  MotionCard,
  PageTransition,
  ScaleIn,
  StaggeredItem,
  StaggeredList,
  useInView,
  usePrefersReducedMotion,
  useStaggerAnimation,
} from "./index";

// 🎯 Example 1: Page Layout with Transitions
export function AnimatedPageExample() {
  return (
    <PageTransition variant="fadeIn" className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Hero Section with Fade In */}
        <FadeIn direction="up" delay={0.2}>
          <section className="py-12 text-center">
            <h1 className="mb-4 text-4xl font-bold">Animated Page Example</h1>
            <p className="text-lg text-gray-600">
              Demonstrating the animation system in action
            </p>
          </section>
        </FadeIn>

        {/* Cards with Scale In */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((item, index) => (
            <ScaleIn key={item} delay={0.1 * index}>
              <MotionCard
                variant="lift"
                className="rounded-lg border bg-white p-6 shadow-md"
              >
                <h3 className="mb-2 text-xl font-semibold">Card {item}</h3>
                <p className="text-gray-600">
                  This card animates on hover and scales in on load.
                </p>
              </MotionCard>
            </ScaleIn>
          ))}
        </div>

        {/* Staggered List */}
        <StaggeredList staggerDelay={0.1}>
          <h2 className="mb-4 text-2xl font-bold">Animated List</h2>
          {Array.from({ length: 5 }, (_, i) => (
            <StaggeredItem key={i}>
              <div className="mb-2 rounded-lg bg-blue-50 p-4">
                <p>List item {i + 1} - Animates with stagger effect</p>
              </div>
            </StaggeredItem>
          ))}
        </StaggeredList>

        {/* Interactive Buttons */}
        <div className="flex justify-center gap-4">
          <MotionButton
            variant="scale"
            className="rounded-lg bg-blue-500 px-6 py-3 text-white hover:bg-blue-600"
          >
            Scale Button
          </MotionButton>
          <MotionButton
            variant="lift"
            className="rounded-lg bg-green-500 px-6 py-3 text-white hover:bg-green-600"
          >
            Lift Button
          </MotionButton>
        </div>
      </div>
    </PageTransition>
  );
}

// 🎯 Example 2: Scroll-triggered Animations
export function ScrollAnimationExample() {
  const { ref: section1Ref, isInView: section1InView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  const { ref: section2Ref, isInView: section2InView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  return (
    <div className="space-y-16">
      {/* Section 1 */}
      <section ref={section1Ref} className="py-16">
        {section1InView && (
          <FadeIn direction="up" duration={0.8}>
            <div className="text-center">
              <h2 className="mb-4 text-3xl font-bold">
                Scroll-triggered Animation
              </h2>
              <p className="mx-auto max-w-2xl text-xl text-gray-600">
                This content animates when it comes into view while scrolling.
              </p>
            </div>
          </FadeIn>
        )}
      </section>

      {/* Section 2 */}
      <section ref={section2Ref} className="py-16">
        {section2InView && (
          <StaggeredList>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <StaggeredItem key={i}>
                  <div className="rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 p-6">
                    <div className="mb-4 h-12 w-12 rounded-full bg-purple-500"></div>
                    <h3 className="mb-2 font-semibold">Feature {i + 1}</h3>
                    <p className="text-sm text-gray-600">
                      This feature animates in with a stagger effect.
                    </p>
                  </div>
                </StaggeredItem>
              ))}
            </div>
          </StaggeredList>
        )}
      </section>
    </div>
  );
}

// 🎯 Example 3: Accessibility-aware Animations
export function AccessibleAnimationExample() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div className="p-6">
      <div className="mb-4 rounded-lg bg-blue-50 p-4">
        <p className="text-sm">
          <strong>Motion Preference:</strong>{" "}
          {prefersReducedMotion
            ? "Reduced motion enabled"
            : "Full animations enabled"}
        </p>
        <p className="mt-1 text-xs text-gray-600">
          This system automatically respects user motion preferences.
        </p>
      </div>

      <FadeIn disabled={prefersReducedMotion} direction="up">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h2 className="mb-4 text-2xl font-bold">Accessible Animation</h2>
          <p className="mb-6 text-gray-600">
            This content will animate only if the user hasn't requested reduced
            motion.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <MotionCard
              disabled={prefersReducedMotion}
              variant="lift"
              className="rounded-lg bg-gray-50 p-4"
            >
              <h3 className="mb-2 font-semibold">Respectful Design</h3>
              <p className="text-sm text-gray-600">
                Animations are disabled when users prefer reduced motion.
              </p>
            </MotionCard>

            <MotionCard
              disabled={prefersReducedMotion}
              variant="scale"
              className="rounded-lg bg-gray-50 p-4"
            >
              <h3 className="mb-2 font-semibold">Better UX</h3>
              <p className="text-sm text-gray-600">
                Inclusive design benefits everyone.
              </p>
            </MotionCard>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}

// 🎯 Example 4: Advanced Stagger Animation
export function AdvancedStaggerExample() {
  const { startStagger, resetStagger } = useStaggerAnimation();

  const items = [
    { icon: "🚀", title: "Performance", description: "Optimized animations" },
    { icon: "♿", title: "Accessibility", description: "Inclusive by design" },
    { icon: "📱", title: "Responsive", description: "Works on all devices" },
    { icon: "🎨", title: "Customizable", description: "Easy to modify" },
    { icon: "🔧", title: "Developer DX", description: "Simple to use" },
    { icon: "⚡", title: "Fast", description: "Smooth 60fps animations" },
  ];

  return (
    <div className="p-6">
      <div className="mb-8 text-center">
        <h2 className="mb-4 text-3xl font-bold">Advanced Stagger Animation</h2>
        <div className="space-x-4">
          <button
            onClick={startStagger}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Start Animation
          </button>
          <button
            onClick={resetStagger}
            className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <div key={index} className="rounded-xl border bg-white p-6 shadow-lg">
            <div className="mb-4 text-4xl">{item.icon}</div>
            <h3 className="mb-2 text-xl font-bold">{item.title}</h3>
            <p className="text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// 🎯 Example Usage in a Component
export function MyComponent() {
  return (
    <div>
      <AnimatedPageExample />
      <ScrollAnimationExample />
      <AccessibleAnimationExample />
      <AdvancedStaggerExample />
    </div>
  );
}
