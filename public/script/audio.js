
export default class CreateGameAudio {
	constructor(src) {
		this.audio = new Howl({
			src
		})
	}

	play() {
		this.audio.play()
	}

	pause() {
		this.audio.pause()
	}

	stop() {
		this.audio.stop()
	}

	replay() {
		this.stop()
		this.play()
	}

	setVolume(vol) {
		this.audio.volume(vol)
	}
}