<script lang="ts">
	let voterId = '';
	let isLoading = false;
	let error = '';

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		if (!voterId.trim()) {
			error = 'Please enter your voter ID';
			return;
		}

		isLoading = true;

		try {
			// TODO: Replace with actual API call to validate voter ID
			// const response = await fetch('/api/voter/validate', {
			//   method: 'POST',
			//   body: JSON.stringify({ voterId });
			// });

			// Placeholder: simulate API call
			await new Promise((resolve) => setTimeout(resolve, 500));

			// Redirect to next step after validation
			// window.location.href = `/voter/confirm?id=${encodeURIComponent(voterId)}`;
			console.log('Voter ID submitted:', voterId);
		} catch (err) {
			error = 'An error occurred. Please try again.';
			console.error(err);
		} finally {
			isLoading = false;
		}
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		voterId = target.value.toUpperCase();
		if (error) {
			error = '';
		}
	}
</script>

<div class="voter-start-container">
	<div class="voter-start-card">
		<div class="card-header">
			<h1>Welcome, Voter</h1>
			<p class="subtitle">Please enter your Voter ID to begin voting</p>
		</div>

		<form on:submit={handleSubmit} class="voter-form">
			<div class="form-group">
				<label for="voter-id-input" class="form-label">Voter ID</label>
				<input
					id="voter-id-input"
					type="text"
					placeholder="Enter your 10-digit Voter ID"
					value={voterId}
					on:input={handleInput}
					disabled={isLoading}
					aria-invalid={error ? 'true' : 'false'}
					aria-describedby={error ? 'error-message' : undefined}
					class="form-input"
				/>
				{#if error}
					<p id="error-message" class="error-message" role="alert">{error}</p>
				{/if}
			</div>

			<button type="submit" disabled={isLoading} class="submit-button">
				{#if isLoading}
					<span class="loading-spinner"></span>
					<span>Processing...</span>
				{:else}
					<span>Continue</span>
				{/if}
			</button>
		</form>

		<div class="scanner-info">
			<p>
				<span class="scanner-icon">📱</span>
				<span class="scanner-text"
					>Scanner support coming soon - you'll be able to scan your voter ID card</span
				>
			</p>
		</div>
	</div>

	<div class="help-section">
		<h2>Need Help?</h2>
		<ul>
			<li><a href="#locate-id">How to locate your Voter ID</a></li>
			<li><a href="#forgot-id">Forgot your Voter ID?</a></li>
			<li><a href="#contact">Contact Election Office</a></li>
		</ul>
	</div>
</div>

<style>
	.voter-start-container {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 20px;
		background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
	}

	.voter-start-card {
		background-color: var(--bg-primary);
		border-radius: 12px;
		border: 1px solid var(--border-color);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
		padding: 60px 40px;
		max-width: 500px;
		width: 100%;
		margin-bottom: 40px;
		transition: box-shadow 0.3s ease;
	}

	.dark .voter-start-card {
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
	}

	.voter-start-card:hover {
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
	}

	.dark .voter-start-card:hover {
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
	}

	.card-header {
		text-align: center;
		margin-bottom: 40px;
	}

	.card-header h1 {
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 12px 0;
		color: var(--text-primary);
	}

	.subtitle {
		font-size: 1rem;
		color: var(--text-secondary);
		margin: 0;
		line-height: 1.5;
	}

	.voter-form {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.form-label {
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--text-primary);
		display: block;
	}

	.form-input {
		padding: 12px 16px;
		border: 2px solid var(--border-color);
		border-radius: 8px;
		background-color: var(--bg-primary);
		color: var(--text-primary);
		font-size: 1rem;
		font-family: inherit;
		transition: all 0.2s ease;
		letter-spacing: 0.05em;
	}

	.form-input::placeholder {
		color: var(--text-secondary);
		opacity: 0.7;
	}

	.form-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.dark .form-input:focus {
		border-color: #60a5fa;
		box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
	}

	.form-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.form-input[aria-invalid='true'] {
		border-color: #ef4444;
	}

	.form-input[aria-invalid='true']:focus {
		box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
	}

	.error-message {
		font-size: 0.875rem;
		color: #ef4444;
		margin: 0;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.error-message::before {
		content: '⚠️';
	}

	.submit-button {
		padding: 14px 24px;
		background-color: #3b82f6;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		margin-top: 12px;
	}

	.submit-button:hover:not(:disabled) {
		background-color: #1e40af;
		transform: translateY(-2px);
		box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
	}

	.submit-button:active:not(:disabled) {
		transform: translateY(0);
	}

	.submit-button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.submit-button:focus-visible {
		outline: 3px solid #3b82f6;
		outline-offset: 3px;
	}

	.dark .submit-button {
		background-color: #60a5fa;
		color: #111827;
	}

	.dark .submit-button:hover:not(:disabled) {
		background-color: #3b82f6;
	}

	.dark .submit-button:focus-visible {
		outline: 3px solid #60a5fa;
	}

	.loading-spinner {
		display: inline-block;
		width: 16px;
		height: 16px;
		border: 2px solid currentColor;
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.scanner-info {
		margin-top: 30px;
		padding: 16px;
		background-color: var(--bg-secondary);
		border-radius: 8px;
		border: 1px solid var(--border-color);
	}

	.scanner-info p {
		display: flex;
		align-items: center;
		gap: 12px;
		margin: 0;
		font-size: 0.95rem;
		color: var(--text-secondary);
		line-height: 1.5;
	}

	.scanner-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
	}

	.help-section {
		max-width: 500px;
		width: 100%;
		background-color: var(--bg-secondary);
		border-radius: 12px;
		border: 1px solid var(--border-color);
		padding: 30px;
	}

	.help-section h2 {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--text-primary);
		margin: 0 0 20px 0;
	}

	.help-section ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.help-section li {
		margin: 0;
	}

	.help-section a {
		color: #3b82f6;
		text-decoration: none;
		font-size: 0.95rem;
		font-weight: 500;
		transition: all 0.2s ease;
		display: inline-block;
	}

	.help-section a:hover {
		text-decoration: underline;
		transform: translateX(4px);
	}

	.help-section a:focus-visible {
		outline: 3px solid #3b82f6;
		outline-offset: 3px;
		border-radius: 4px;
		padding: 4px 8px;
	}

	.dark .help-section a {
		color: #60a5fa;
	}

	.dark .help-section a:focus-visible {
		outline-color: #60a5fa;
	}

	/* Responsive Design */
	@media (max-width: 640px) {
		.voter-start-container {
			padding: 20px;
		}

		.voter-start-card {
			padding: 40px 24px;
		}

		.card-header h1 {
			font-size: 1.625rem;
		}

		.help-section {
			padding: 20px;
		}

		.submit-button {
			padding: 12px 20px;
			font-size: 0.95rem;
		}
	}
</style>
