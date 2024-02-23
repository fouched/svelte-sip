<script>
	import {register, startCall, answerIncoming, transferCall, endSession,} from "$lib/sip/hello.client.js"
	import statusStore from '$lib/store/status.store.js'

	let ext = '9010';
	let pwd = 'UnifiAfrica2022';
	let tel = '0828565009'
	let transferExt = ''

	const onLogin = () => {
		console.log('logging in with ext:' + ext + ' pwd:' + pwd)
		register(ext, pwd)
	}

	const onStartCall = () => {
		console.log('calling ' + tel)
		startCall(tel)
	}

	const onAnswerIncoming = () => {
		answerIncoming()
	}

	const onEndCall = () => {
		endSession()
	}

	const onTransfer = () => {
		transferCall(transferExt)
	}
</script>

<hr>
	<div id="stateInfo">{ $statusStore.statusText }</div>
<hr>
<h2>Login</h2>
	Ext:&nbsp;<input type="text" name="ext" id="ext" bind:value={ext} />&nbsp;
	Pwd:&nbsp;<input type="text" name="pwd" id="pwd" bind:value={pwd} />
	<button on:click={onLogin}>Login</button>
	<button>Clear</button>
	<br><br>
<hr>

<h2>Outgoing</h2>
	Call:&nbsp;<input type="text" name="tel" id="tel" bind:value={tel}/>
	{#if $statusStore.registered}
		<button id="btnCall" on:click={onStartCall}>&nbsp;Call&nbsp;</button>&nbsp;
	{:else}
		<button id="btnCall" disabled>&nbsp;Call&nbsp;</button>&nbsp;
	{/if}
	<button >Hang Up</button>
	<br><br>
<hr>
<h2>Incoming</h2>
	{#if $statusStore.registered}
		<button id="btnAnswer" on:click={onAnswerIncoming}>Answer Call</button>&nbsp;
	{:else}
		<button id="btnAnswer" disabled>Answer Call</button>&nbsp;
	{/if}
	<button on:click={onEndCall}>Hang Up</button>
	<br><br>
<hr>
<h2>Transfer</h2>
	To:&nbsp;<input type="text" name="toExt" id="toExt" value="" />&nbsp;
	{#if $statusStore.registered}
		<button on:click={onTransfer} id="btnTx">Transfer</button>
	{:else}
		<button id="btnTx" disabled>Transfer</button>
	{/if}
	<br><br>
<hr>
<audio id="remoteAudio" autoplay> </audio>
