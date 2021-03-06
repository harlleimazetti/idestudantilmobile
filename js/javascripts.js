document.addEventListener("deviceready", onDeviceReady, false); 
function onDeviceReady() {
	$.mobile.defaultPageTransition = 'none';
	$.mobile.defaultDialogTransition = 'none';
	$.mobile.allowCrossDomainPages = true;
	$.mobile.phonegapNavigationEnabled = true;
	$.support.cors = true;
	//sincronizar();
}

function sairApp() {
	navigator.app.exitApp();	
}

$(document).on('click', '.sair_app', function(event) {
	sairApp();
	event.preventDefault();
});

$(document).on("touchstart", ".tabela_home tr td", function() {
	$(this).addClass("ativa");	
});

$(document).on("touchend", ".tabela_home tr td", function() {
	$(this).removeClass("ativa");	
});

$(document).on("click", ".tabela_home tr td", function() {
	var url = $(this).data('url');
	$( ":mobile-pagecontainer" ).pagecontainer( "change", url );
});

$(document).on( "click" , "#btn-pesquisar-matricula", function () {
	$.mobile.loading( "show", {
		text: "Pesquisando...",
		textVisible: true,
		theme: "b",
		html: ""
	});
	get_config(1, function(config) {
		var matricula = $('#matricula').val();
		var url_servidor = config.url_servidor;
		$.ajax({
			url: url_servidor,
			data: {acao: 'pesquisar_matricula', dados : {matricula : matricula}},
			dataType: 'jsonp',
			jsonp: 'callback',
			success: function(resultado) {
				sessionStorage.resultado = JSON.stringify(resultado);
				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function(){
					if (this.readyState == 4 && this.status == 200){
						//this.response is what you're looking for
						//handler(this.response);
						//console.log(this.response, typeof this.response);
						var img = document.getElementById('img_carteira');
						var url = window.URL || window.webkitURL;
						img.src = url.createObjectURL(this.response);
						var img = document.getElementById('img_carteira_b');
						var url = window.URL || window.webkitURL;
						img.src = url.createObjectURL(this.response);
					}
				}
				url_imagem = url_servidor + '?dados=&callback=&acao=imagem&carteira_id=' + resultado.carteira[0].id;
				//console.log(url_imagem);
				xhr.open('GET', url_imagem);
				xhr.responseType = 'blob';
				xhr.send();
				$.mobile.loading( "hide" );
				$(':mobile-pagecontainer').pagecontainer('change', '#resultado');
			},
			error: function (xhr, textStatus, thrownError) {
				//console.log('textStatus: ' + textStatus + ', thrownError: ' + thrownError);
				alert('textStatus: ' + textStatus + ', thrownError: ' + thrownError);
			}
		});
	});
});

$(document).on('pagebeforeshow', '#resultado', function()
{
	resultado = $.parseJSON(sessionStorage.resultado);
	console.log(resultado);
	$('.carteira_nome').html(resultado.carteira[0].nome);
	$('.carteira_colegio').html(resultado.carteira[0].colegio);
	$('.carteira_matricula').html(resultado.carteira[0].matricula);
	$('.carteira_numero').html(resultado.carteira[0].numero);
	$('.carteira_nascimento').html(resultado.carteira[0].nascimento);
	$('.carteira_posto_atendimento').html(resultado.carteira[0].posto_atendimento);
	$('.carteira_obs').html(resultado.carteira[0].obs);
	$('.carteira_curso_turma').html(resultado.carteira[0].curso_turma);
	$('.icon_resultado').removeClass('fa-check');
	$('.icon_resultado').removeClass('fa-close');
	$('.icone_resultado').removeClass('icon-background-valido');
	$('.icone_resultado').removeClass('icon-background-invalido');
	$('.row_resultado').removeClass('clr-bg-green');
	$('.row_resultado').removeClass('clr-bg-red');
	if (resultado.status == 'er') {
		$('.icon_resultado').addClass('fa-close');
		$('.icone_resultado').addClass('icon-background-invalido');
		$('.row_resultado').addClass('clr-bg-red');
	} else {
		$('.icon_resultado').addClass('fa-check');
		$('.icone_resultado').addClass('icon-background-valido');
		$('.row_resultado').addClass('clr-bg-green');
	}
	$('.carteira_mensagem').html(resultado.mensagem);
});

function sincronizar() {
	$.mobile.loading( "show", {
		text: "Pesquisando...",
		textVisible: true,
		theme: "b",
		html: ""
	});
	get_config(1, function(config) {
		var url_servidor = config.url_servidor;
		var id_pessoa = config.id_pessoa;
		$.ajax({
			url: url_servidor,
			data: {acao: 'sincronizar', dados : {id_pessoa : id_pessoa}},
			dataType: 'jsonp',
			jsonp: 'callback',
			success: function(resultado) {
				//console.log(resultado);
				var contas = resultado.pessoas[0].contas;
				//console.log(contas);
				$.each(contas, function(key, conta) {
					atualizar_contas(conta, function(resultado) {
						//console.log(resultado.mensagem);
					});
				});
				var lancamentos = resultado.pessoas[0].contas[0].lancamentos;
				//console.log(lancamentos);
				$.each(lancamentos, function(key, lancamento) {
					atualizar_lancamentos(lancamento, function(resultado) {
						//console.log(resultado.mensagem);
					});
				});
				$.mobile.loading( "hide" );
			},
			error: function (xhr, textStatus, thrownError) {
				//console.log('textStatus: ' + textStatus + ', thrownError: ' + thrownError);
				alert('textStatus: ' + textStatus + ', thrownError: ' + thrownError);
			}
		});
	});
}