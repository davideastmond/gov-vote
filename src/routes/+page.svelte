<div class="landing-container">
	<div class="hero-section">
		<div class="hero-content">
			<h1 class="hero-title">Gov-Vote</h1>
			<p class="hero-subtitle">Secure and Accessible Voting for Everyone</p>
			<p class="hero-description">
				A modern, accessible voting platform designed with government standards and user
				accessibility at its core.
			</p>
		</div>

		<div class="cta-buttons">
			<a href="/admin" class="btn btn-primary" role="button">
				<span class="btn-icon">🔐</span>
				<span class="btn-text">Admin Login</span>
			</a>
			<a href="/voter/start" class="btn btn-secondary" role="button">
				<span class="btn-icon">🗳️</span>
				<span class="btn-text">Vote Now</span>
			</a>
		</div>
	</div>

	<div class="features-section">
		<h2>Why Choose Gov-Vote</h2>
		<div class="features-grid">
			<div class="feature-card">
				<div class="feature-icon">♿</div>
				<h3>Fully Accessible</h3>
				<p>Built with WCAG 2.1 AA standards to ensure everyone can participate.</p>
			</div>

			<div class="feature-card">
				<div class="feature-icon">🔒</div>
				<h3>Secure</h3>
				<p>Industry-leading security protocols to protect your voting data.</p>
			</div>

			<div class="feature-card">
				<div class="feature-icon">🌙</div>
				<h3>Dark Mode</h3>
				<p>Comfortable voting experience in any lighting condition.</p>
			</div>

			<div class="feature-card">
				<div class="feature-icon">📱</div>
				<h3>Responsive</h3>
				<p>Works seamlessly on desktop, tablet, and mobile devices.</p>
			</div>
		</div>
	</div>

	<footer class="landing-footer">
		<p>&copy; 2026 Gov-Vote. All rights reserved.</p>
		<nav class="footer-links">
			<a href="#privacy">Privacy Policy</a>
			<a href="#accessibility">Accessibility Statement</a>
			<a href="#contact">Contact Us</a>
		</nav>
	</footer>
</div>

<style>
	.landing-container {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: var(--bg-primary);
		color: var(--text-primary);
	}

	/* Hero Section */
	.hero-section {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 60px 20px;
		text-align: center;
		background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
	}

	.hero-content {
		max-width: 700px;
		margin-bottom: 60px;
	}

	.hero-title {
		font-size: clamp(2.5rem, 8vw, 4rem);
		font-weight: 700;
		margin: 0 0 20px 0;
		letter-spacing: -0.02em;
		background: linear-gradient(135deg, #3b82f6, #1e40af);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.dark .hero-title {
		background: linear-gradient(135deg, #60a5fa, #93c5fd);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.hero-subtitle {
		font-size: clamp(1.25rem, 4vw, 1.875rem);
		font-weight: 600;
		color: var(--text-primary);
		margin: 0 0 20px 0;
	}

	.hero-description {
		font-size: 1.125rem;
		color: var(--text-secondary);
		margin: 0;
		line-height: 1.6;
	}

	/* CTA Buttons */
	.cta-buttons {
		display: flex;
		gap: 20px;
		flex-wrap: wrap;
		justify-content: center;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		padding: 16px 32px;
		border-radius: 8px;
		font-size: 1.0625rem;
		font-weight: 600;
		text-decoration: none;
		border: 2px solid transparent;
		cursor: pointer;
		transition: all 0.3s ease;
		text-align: center;
		outline-offset: 3px;
	}

	.btn:focus-visible {
		outline: 3px solid #3b82f6;
	}

	.dark .btn:focus-visible {
		outline: 3px solid #60a5fa;
	}

	.btn-primary {
		background-color: #3b82f6;
		color: white;
		border-color: #3b82f6;
	}

	.btn-primary:hover {
		background-color: #1e40af;
		border-color: #1e40af;
		transform: translateY(-2px);
		box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
	}

	.btn-primary:active {
		transform: translateY(0);
	}

	.btn-secondary {
		background-color: transparent;
		color: #3b82f6;
		border-color: #3b82f6;
	}

	.btn-secondary:hover {
		background-color: #3b82f6;
		color: white;
		transform: translateY(-2px);
		box-shadow: 0 8px 16px rgba(59, 130, 246, 0.2);
	}

	.btn-secondary:active {
		transform: translateY(0);
	}

	.dark .btn-primary {
		background-color: #60a5fa;
		border-color: #60a5fa;
		color: #111827;
	}

	.dark .btn-primary:hover {
		background-color: #3b82f6;
		border-color: #3b82f6;
	}

	.dark .btn-secondary {
		color: #60a5fa;
		border-color: #60a5fa;
	}

	.dark .btn-secondary:hover {
		background-color: #60a5fa;
		color: #111827;
	}

	.btn-icon {
		font-size: 1.5rem;
	}

	.btn-text {
		font-weight: 600;
	}

	/* Features Section */
	.features-section {
		padding: 80px 20px;
		max-width: 1200px;
		margin: 0 auto;
		width: 100%;
	}

	.features-section > h2 {
		font-size: clamp(2rem, 5vw, 2.5rem);
		font-weight: 700;
		text-align: center;
		margin: 0 0 60px 0;
		color: var(--text-primary);
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 30px;
	}

	.feature-card {
		padding: 30px;
		background-color: var(--bg-secondary);
		border-radius: 12px;
		border: 1px solid var(--border-color);
		transition: all 0.3s ease;
		text-align: center;
	}

	.feature-card:hover {
		transform: translateY(-4px);
		border-color: #3b82f6;
		box-shadow: 0 12px 24px rgba(59, 130, 246, 0.1);
	}

	.dark .feature-card:hover {
		border-color: #60a5fa;
		box-shadow: 0 12px 24px rgba(96, 165, 250, 0.1);
	}

	.feature-icon {
		font-size: 3rem;
		margin-bottom: 16px;
	}

	.feature-card h3 {
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0 0 12px 0;
		color: var(--text-primary);
	}

	.feature-card p {
		font-size: 0.95rem;
		color: var(--text-secondary);
		margin: 0;
		line-height: 1.5;
	}

	/* Footer */
	.landing-footer {
		background-color: var(--bg-secondary);
		border-top: 1px solid var(--border-color);
		padding: 40px 20px;
		text-align: center;
		margin-top: auto;
	}

	.landing-footer p {
		margin: 0 0 20px 0;
		font-size: 0.95rem;
		color: var(--text-secondary);
	}

	.footer-links {
		display: flex;
		justify-content: center;
		gap: 30px;
		flex-wrap: wrap;
	}

	.footer-links a {
		color: #3b82f6;
		text-decoration: none;
		font-size: 0.95rem;
		transition: all 0.2s ease;
	}

	.footer-links a:hover {
		text-decoration: underline;
	}

	.footer-links a:focus-visible {
		outline: 3px solid #3b82f6;
		border-radius: 4px;
		padding: 4px 8px;
	}

	.dark .footer-links a {
		color: #60a5fa;
	}

	.dark .footer-links a:focus-visible {
		outline: 3px solid #60a5fa;
	}

	/* Responsive Design */
	@media (max-width: 640px) {
		.hero-section {
			padding: 40px 20px;
		}

		.cta-buttons {
			flex-direction: column;
			width: 100%;
		}

		.btn {
			width: 100%;
			justify-content: center;
		}

		.features-grid {
			grid-template-columns: 1fr;
		}

		.landing-footer {
			padding: 30px 20px;
		}

		.footer-links {
			flex-direction: column;
			gap: 10px;
		}
	}
</style>
