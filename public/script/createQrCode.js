const createQrCode = () => {
  const qr = `<div class="w-screen h-screen flex flex-col justify-center items-center">
		<div class="bg-white-100 w-[280px] h-[280px] mx-auto rounded-[20px]">
		<img src="/game/icons/qrcode.svg" width="280" height="280"/>
		</div>
		<h1 class="text-[28px] leading-[32px] f-semi text-white-100 mx-auto text-center mt-[40px]">Scan on mobile</h1>	
	</div>`;

  document.body.classList.add("vb");
  document.getElementById("wrapper").insertAdjacentHTML("afterbegin", qr);
};

export { createQrCode };
