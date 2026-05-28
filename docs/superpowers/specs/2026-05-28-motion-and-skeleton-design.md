# Motion and Skeleton Design

## Context

The UniApp mobile MVP currently switches between tabs, course categories, course details, and lesson playback with abrupt content replacement. Course list loading uses a blank gap while data is fetched, course detail hides the entire page until the request resolves, and the player page shows plain loading text. The bottom tab bar has only a basic background transition.

The approved direction is to introduce a reusable animation foundation now, because the app will grow and page-level animation should not become scattered one-off CSS.

## Goals

- Add a complete animation library that can be reused across future pages.
- Hide library details behind project components and style tokens.
- Provide skeleton screens for page and data transitions.
- Add polished but restrained motion that matches the existing bright education app style.
- Keep UniApp multi-platform compatibility in mind and avoid fragile overlays on native video.

## Non-Goals

- Do not redesign the current page layouts.
- Do not change routing structure or API contracts.
- Do not introduce complex gesture or shared-element transitions in this pass.
- Do not overlay custom animated UI on top of native video components.

## Library Choice

Use `animate.css` as the first animation library.

Reasons:

- It is CSS class based, simple to integrate into the current UniApp project.
- It works well for page enter, list enter, pulse, fade, and press feedback patterns.
- It avoids depending on browser-only runtime DOM APIs that can be risky across UniApp targets.

`@vueuse/motion` remains a future option for H5-specific or DOM-rich experiences, but it should not be the first foundation for this multi-platform MVP.

## Architecture

Add a small dependency entry at `edu-app/package.json` with `animate.css`.

Add project-level motion styles in `edu-app/styles/variables.css`:

- Motion duration tokens.
- Motion easing tokens.
- Skeleton base and highlight colors.
- Shared keyframes for skeleton shimmer.

Import `animate.css` globally from `edu-app/App.vue`, alongside existing global variables.

Add reusable components:

- `edu-app/components/MotionView.vue`
  - Wraps slot content.
  - Accepts animation name, duration, delay, and custom class.
  - Emits stable `animate__animated` class names so pages do not depend directly on library naming.
- `edu-app/components/SkeletonBlock.vue`
  - Renders a reusable skeleton rectangle.
  - Supports width, height, radius, dark mode, and optional custom class.
  - Uses project shimmer styles rather than external images.

Page components should consume these wrappers instead of scattering animation library classes directly.

## Page Behavior

### Bottom Tab Pages

Home, Course, Message, and Mine page content enters with a subtle fade/up animation. The custom tab bar keeps its current floating capsule style and gains:

- Press feedback on tab items.
- Smoother selected background, icon, and text transitions.
- Small selected-item scale feedback.

### Course Category Switching

When the active category changes:

- Keep the category bar visible and stable.
- Show course-card skeleton rows in the list area while fetching.
- Fade/up animate course cards after data resolves.
- Preserve the empty state when no courses exist.

### Course Detail

While loading:

- Show a detail skeleton with cover, title lines, stats, teacher card, lesson rows, and intro block.
- Fade/up animate the real detail sections after data resolves.
- Keep the bottom action bar out of the loading state until course data exists.

### Lesson Playback

While loading:

- Show a dark player skeleton in the player area.
- Keep the header stable.
- Fade in playback info after lesson data resolves.

The actual `video` element remains unwrapped by complex overlays beyond its parent area to avoid native layer issues on non-H5 platforms.

## Error Handling

Existing request toast behavior remains. If a request fails:

- Loading state must still end.
- Skeletons must disappear.
- Existing empty or absent-content behavior should remain stable.

This pass does not add retry UI.

## Testing And Verification

Verification should include:

- Dependency installation or lockfile generation if the local toolchain supports it.
- Static inspection/build check available for the UniApp project.
- Manual H5 run if a dev command is available after adding `package.json`.
- Visual check that:
  - Tab pages animate on entry.
  - Course category switching shows skeleton rows.
  - Course detail no longer opens blank.
  - Player loading uses a dark skeleton.
  - Bottom tab press/selected motion does not resize the navigation layout.

## Scope Notes

The current repo has existing uncommitted page and mock changes. Implementation must preserve those changes and only edit files required for the animation foundation and affected pages.
