
gsap.registerPlugin(ScrollTrigger)

document.addEventListener('DOMContentLoaded', () => {
	const path = document.getElementById('stroke-path')
	if (!path) return

	const pathLength = path.getTotalLength()

	path.style.strokeDasharray = pathLength
	path.style.strokeDashoffset = pathLength

	gsap.to(path, {
		strokeDashoffset: 0,
		ease: 'none',
		scrollTrigger: {
			trigger: '.spotlight',
			start: 'top top',
			end: 'bottom bottom',
			scrub: true,
		},
	})
})