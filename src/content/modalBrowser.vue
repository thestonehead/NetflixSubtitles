<template>
	<transition>
		<div class="modal">
			<iframe :src="url"></iframe>
		</div>
	</transition>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import { Prop } from "vue-property-decorator";

export default class ModalBrowser extends Vue {
	@Prop()
	public url!: string;

	mounted() {}
}
</script>

<style lang="scss" scoped>
.modal {
	position: fixed;
	width: 80%;
	height: 80%;
	background: white;
	border: 2px solid black;
	display: block;
	top: 10%;
	left: 10%;
	z-index: 1000;
}
</style>