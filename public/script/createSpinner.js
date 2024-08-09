const createSpinner = () => {
  const wrapper = document.querySelector(".wrapper");
  const spinner = `<div class="f-spinner hidden">
	<svg
	  class="svg"
	  xmlns="http://www.w3.org/2000/svg"
	  viewBox="0 0 16 13.86"
	>
	  <defs>
		<polygon
		  id="hexagon"
		  points="4.29 13.36 0.58 6.93 4.29 0.5 11.71 0.5 15.42 6.93 11.71 13.36 4.29 13.36"
		/>
		<g id="inner-shadow" transform="translate(-2, -2)">
		  <use
			xlink:href="#hexagon"
			class="f-spinner__inner-shadow"
			transform="scale(1.25)"
		  />
		</g>
	  </defs>

	  <mask id="mask">
		<rect x="-4" y="-4" width="24" height="24" fill="black" />
		<use xlink:href="#hexagon" fill="white" />
	  </mask>

	  <use xlink:href="#hexagon" class="f-spinner__fill" />
	  <use xlink:href="#hexagon" class="f-spinner__fill--animated" />
	  <use xlink:href="#inner-shadow" mask="url(#mask)" />
	</svg>
  </div>`;

  if (wrapper) wrapper.insertAdjacentHTML("afterbegin", spinner);
};

export { createSpinner };
