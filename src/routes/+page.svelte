<!-- Skip to main content link for keyboard navigation -->
<a
	href="#main-content"
	class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-blue-500 focus:px-4 focus:py-2 focus:text-white focus:outline focus:outline-[3px] focus:outline-blue-500"
>
	Skip to main content
</a>

<div class="flex min-h-screen flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
	<!-- Hero Section -->
	<section
		class="flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)] px-5 py-15 text-center sm:py-10"
		aria-labelledby="hero-heading"
	>
		<div class="mb-15 max-w-[700px]">
			<h1
				id="hero-heading"
				class="m-0 mb-5 bg-gradient-to-br from-blue-500 to-blue-800 bg-clip-text text-[clamp(2.5rem,8vw,4rem)] font-bold tracking-tight text-transparent dark:from-blue-400 dark:to-blue-200"
			>
				Gov-Vote
			</h1>
			<p
				class="m-0 mb-5 text-[clamp(1.25rem,4vw,1.875rem)] font-semibold text-[var(--text-primary)]"
			>
				Secure and Accessible Voting for Everyone
			</p>
			<p class="m-0 text-lg leading-relaxed text-[var(--text-secondary)]">
				A modern, accessible voting platform designed with government standards and user
				accessibility at its core.
			</p>
		</div>

		<div class="flex max-w-[1200px] flex-wrap justify-center gap-5 sm:w-full sm:flex-col">
			<a
				href="/admin/login"
				class="inline-flex cursor-pointer items-center gap-3 rounded-lg border-2 border-blue-500 bg-blue-500 px-8 py-4 text-center text-[1.0625rem] font-semibold text-white no-underline outline-offset-1 transition-all hover:-translate-y-0.5 hover:border-blue-800 hover:bg-blue-800 hover:shadow-[0_8px_16px_rgba(59,130,246,0.3)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-blue-500 active:translate-y-0 sm:w-full sm:justify-center dark:border-blue-400 dark:bg-blue-400 dark:text-gray-900 dark:hover:border-blue-500 dark:hover:bg-blue-500 dark:focus-visible:outline-blue-400"
				aria-label="Go to Admin Login page"
			>
				<span aria-hidden="true" class="text-2xl font-semibold">🔐</span>
				<span class="font-semibold dark:text-black">Admin Login</span>
			</a>
			<a
				href="/voter/start"
				class="inline-flex cursor-pointer items-center gap-3 rounded-lg border-2 border-blue-500 bg-transparent px-8 py-4 text-center text-[1.0625rem] font-semibold text-blue-500 no-underline outline-offset-1 transition-all hover:-translate-y-0.5 hover:bg-blue-500 hover:text-white hover:shadow-[0_8px_16px_rgba(59,130,246,0.2)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-blue-500 active:translate-y-0 sm:w-full sm:justify-center dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-gray-900 dark:focus-visible:outline-blue-400"
				aria-label="Go to voting page to cast your vote"
			>
				<span aria-hidden="true" class="text-2xl font-semibold">🗳️</span>
				<span class="font-semibold">Vote Now</span>
			</a>
		</div>
	</section>

	<!-- Main Content -->
	<main id="main-content" class="mx-auto w-full max-w-[1200px] px-5 py-20">
		<h2
			class="m-0 mb-15 text-center text-[clamp(2rem,5vw,2.5rem)] font-bold text-[var(--text-primary)]"
		>
			Why Choose Gov-Vote
		</h2>
		<div
			class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-7.5 sm:grid-cols-1"
			role="list"
		>
			<article
				class="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-7.5 text-center transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-[0_12px_24px_rgba(59,130,246,0.1)] dark:hover:border-blue-400 dark:hover:shadow-[0_12px_24px_rgba(96,165,250,0.1)]"
				role="listitem"
			>
				<div aria-hidden="true" class="mb-4 text-5xl">♿</div>
				<h3 class="m-0 mb-3 text-xl font-bold text-[var(--text-primary)]">Fully Accessible</h3>
				<p class="m-0 text-[0.95rem] leading-normal text-[var(--text-secondary)]">
					Built with WCAG 2.1 AA standards to ensure everyone can participate.
				</p>
			</article>

			<article
				class="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-7.5 text-center transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-[0_12px_24px_rgba(59,130,246,0.1)] dark:hover:border-blue-400 dark:hover:shadow-[0_12px_24px_rgba(96,165,250,0.1)]"
				role="listitem"
			>
				<div aria-hidden="true" class="mb-4 text-5xl">🔒</div>
				<h3 class="m-0 mb-3 text-xl font-bold text-[var(--text-primary)]">Secure</h3>
				<p class="m-0 text-[0.95rem] leading-normal text-[var(--text-secondary)]">
					Industry-leading security protocols to protect your voting data.
				</p>
			</article>

			<article
				class="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-7.5 text-center transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-[0_12px_24px_rgba(59,130,246,0.1)] dark:hover:border-blue-400 dark:hover:shadow-[0_12px_24px_rgba(96,165,250,0.1)]"
				role="listitem"
			>
				<div aria-hidden="true" class="mb-4 text-5xl">🌙</div>
				<h3 class="m-0 mb-3 text-xl font-bold text-[var(--text-primary)]">Dark Mode</h3>
				<p class="m-0 text-[0.95rem] leading-normal text-[var(--text-secondary)]">
					Comfortable voting experience in any lighting condition.
				</p>
			</article>

			<article
				class="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-7.5 text-center transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-[0_12px_24px_rgba(59,130,246,0.1)] dark:hover:border-blue-400 dark:hover:shadow-[0_12px_24px_rgba(96,165,250,0.1)]"
				role="listitem"
			>
				<div aria-hidden="true" class="mb-4 text-5xl">📱</div>
				<h3 class="m-0 mb-3 text-xl font-bold text-[var(--text-primary)]">Responsive</h3>
				<p class="m-0 text-[0.95rem] leading-normal text-[var(--text-secondary)]">
					Works seamlessly on desktop, tablet, and mobile devices.
				</p>
			</article>
		</div>
	</main>

	<footer
		class="mt-auto border-t border-[var(--border-color)] bg-[var(--bg-secondary)] px-5 py-10 text-center"
	>
		<p class="m-0 mb-5 text-[0.95rem] text-[var(--text-secondary)]">
			&copy; 2026 Gov-Vote. All rights reserved.
		</p>
		<nav
			aria-label="Footer navigation"
			class="flex flex-wrap justify-center gap-7.5 sm:flex-col sm:gap-2.5"
		>
			<a
				href="#privacy"
				class="text-[0.95rem] text-blue-500 no-underline transition-all hover:underline focus-visible:rounded focus-visible:px-2 focus-visible:py-1 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-blue-500 dark:text-blue-400 dark:focus-visible:outline-blue-400"
			>
				Privacy Policy
			</a>
			<a
				href="#accessibility"
				class="text-[0.95rem] text-blue-500 no-underline transition-all hover:underline focus-visible:rounded focus-visible:px-2 focus-visible:py-1 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-blue-500 dark:text-blue-400 dark:focus-visible:outline-blue-400"
			>
				Accessibility Statement
			</a>
			<a
				href="#contact"
				class="text-[0.95rem] text-blue-500 no-underline transition-all hover:underline focus-visible:rounded focus-visible:px-2 focus-visible:py-1 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-blue-500 dark:text-blue-400 dark:focus-visible:outline-blue-400"
			>
				Contact Us
			</a>
		</nav>
	</footer>
</div>
