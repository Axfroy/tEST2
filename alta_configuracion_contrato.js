var gListaPrecio = '';
var rownumber = '';
var reqCant = 0;

var listServicios = [];
var listDescuentos = [];
function objServicio(rowId, serviceId, servicePrice, cantidad) {
	(this.rowId = rowId),
		(this.serviceId = serviceId),
		(this.servicePrice = servicePrice),
		(this.cantidad = cantidad);
}

function objDescuento(rowId, monto, porcentaje, base) {
	(this.rowId = rowId),
		(this.monto = monto),
		(this.porcentaje = porcentaje),
		(this.base = base);
}

function sumPrice() {
	var total = 0;
	for (var i = 0; i < listServicios.length; i++) {
		var precio = listServicios[i].servicePrice;
		for (var a = 0; a < listDescuentos.length; a++) {
			if (listDescuentos[a].rowId == listServicios[i].rowId) {
				if (listDescuentos[a].monto != 0) {
					precio = listDescuentos[a].monto;
				} else {
					precio =
						listServicios[i].servicePrice -
						(listServicios[i].servicePrice *
							listDescuentos[a].porcentaje) /
							100;
				}
			}
		}
		total +=
			listServicios[i].cantidad != 0
				? parseFloat(
						parseFloat(precio * listServicios[i].cantidad).toFixed(
							2
						)
				  )
				: precio;
	}
	$('#totalpl').text(parseFloat(total).toFixed(2));
}

var idDebito = '{B6F1F6F6-5601-11D5-BB61-00508BFC5002}';
var idCuentaCorriente = '{8859FB5E-880F-11D5-BB9B-00508BFC5273}';
var idEfectivo = '{B6F1F6F7-5601-11D5-BB61-00508BFC5002}';

$(document).ready(function () {
	gListaPrecio = $('#lp').val();
	$('#IN_FECHANACIMIENTO').mask('99/99/9999');
	$('#IN_CUIT').mask('99-99999999-9');
	$('#formConfigurador :input').prop('disabled', true);
	$('#btnGuardarConf').prop('disabled', true);
	// $('#IN_NUMEROCBU').mask('?9999999999999999999999');
	// $('#TARJETANUMERO').mask('?999999999999999999');
	$('#IN_FORMAPAGO').on('change', function () {
		if ($(this).val() === idEfectivo) {
			$('#IN_TARJETATIPO').val('');
			$('#TARJETANUMERO').val('');
			$('.tarjeta-group').hide();
			$('.cbu-group').hide();
		}
		if ($(this).val() === idCuentaCorriente) {
			$('#IN_NUMEROCBU').attr('required', 'True');
			$('#TARJETANUMERO').removeAttr('required');
			$('.cbu-group').show();
			$('.tarjeta-group').hide();
			cbuInputValidation();
		}
		if ($(this).val() === idDebito) {
			$('#TARJETANUMERO').attr('required', 'True');
			$('#IN_NUMEROCBU').removeAttr('required');
			$('.cbu-group').hide();
			$('.tarjeta-group').show();
			cardNumberInputValidation();
		}
		if ($(this).val() === '') {
			$('.tarjeta-group').hide();
			$('.cbu-group').hide();
		}
	});

	if ($('#IN_FORMAPAGO').val() === idCuentaCorriente) {
		$('.cbu-group').show();
	}
	if ($('#IN_FORMAPAGO').val() === idDebito) {
		$('.tarjeta-group').show();
	}
});
$('#modalConfg tr').livequery(function () {
	$(this).on('dblclick', function () {
		idServicio = $(this).find('td:first').text();
		nombreServicio = $(this).find('td:nth-child(2)').text();
		listaPrecio = gListaPrecio;
		tipoServicio = $(this).closest('table').attr('id');
		var clase = $(this).closest('.modal').attr('class');
		if (clase) {
			var claseMatch = clase.match('modalDescuentos');
		} else {
			var claseMatch = null;
		}
		if (
			$('#ITEMCONT tbody').text().trim() ===
			'No se encontraron ítems en el contrato'
		) {
			$('#ITEMCONT').html(
				'<thead><tr><th></th><th>CODIGO</th><th>DESCRIPCION</th><th>TIPO_SERVICIO</th><th>PRECIO</th></tr></thead><tbody></tbody>'
			);
		}
		if (
			tipoServicio != 'ITEMCONT' &&
			idServicio != '03000115' &&
			claseMatch == null
		) {
			parameters =
				'{ "IN_CODIGO" : "' +
				idServicio +
				'" , "IN_LISTAPRECIO" : "' +
				listaPrecio +
				'" , "IN_SERVICIO" : "' +
				tipoServicio +
				'" }';
			parameters = JSON.parse(parameters);

			chkCantResponse = $.ajax({
				url: '_ajax_configuracion_contrato.php?sp=cantidad',
				type: 'POST',
				data: {
					id: idServicio
				}
			});

			chkCantResponse.done(function (requiereCantidad) {
				reqCant = requiereCantidad;
				if (requiereCantidad == 1) {
					$('#popCantidad').val('0');
					$('#modalCantidad').modal('show');
				} else {
					$('#popCantidad').val('0');
					getPreceOblg(parameters);
				}
			});

			chkCantResponse.fail(function (jqXHR, textStatus) {
				console.log('Request chkCantResponse failed: ' + textStatus);
			});
		} else if (idServicio == '03000115') {
			$('#mdldscNext').show();
			$('#mdldscSave').hide();
			$('.modalDescuentos .modal-body').html(
				'<form class="form-horizontal"> <div class="control-group"> <label for="nroItem" class="control-label">Número de Ítem</label> <div class="controls"> <input type="text" name="nroItem" id="nroItem" class="input-xlarge" value=""> </div> </div> </form>'
			);
			$('.modalDescuentos').modal('show');
		} else if (claseMatch) {
			var duracion = $(this).find('td').eq(1).text();
			var porcentaje = $(this).find('td').eq(3).text();
			var monto = $(this).find('td').eq(2).text();
			var rowSelected = $('#ITEMCONT').find('tr').eq(mdldscInput);
			var rowCod = rowSelected.find('td').eq(1).text();
			var rowPrice = rowSelected
				.find('td')
				.eq(4)
				.text()
				.replace(/\$/gim, '');
			var rowDesc = rowSelected.find('td').eq(2).text();
			var rowType = rowSelected.find('td').eq(3).text();
			var servicio = rowCod + ' - ' + rowDesc;
			$('.modalDescuentos tr').removeClass('newrow');
			$(this).addClass('newrow');
			var porcetajeSTR = pad(porcentaje, 5);
			var porcetajeSTR = porcetajeSTR.toString();
			var dscString =
				'DESCUENTOS (Item: ' +
				pad(mdldscInput, 2) +
				', Dur.: ' +
				pad(duracion, 2) +
				' meses, Porc.: ' +
				porcetajeSTR.substr(0, 5) +
				'%, Monto: $' +
				pad(monto, 5) +
				', Servicio: ' +
				servicio +
				')';
			rownumber = $('#ITEMCONT')
				.find('tr')
				.last()
				.find('td')
				.first()
				.text();
			rownumber++;
			console.log('nico ' + parseFloat(porcentaje));
			var oDesc = new objDescuento(
				parseInt(mdldscInput),
				parseFloat(monto),
				parseFloat(porcentaje),
				parseFloat(rowPrice)
			);
			listDescuentos.push(oDesc);
			var importe = 0;
			if (oDesc.monto !== 0) {
				importe = parseFloat(oDesc.base - oDesc.monto).toFixed(2);
			}
			if (oDesc.porcentaje !== 0) {
				importe = parseFloat(
					(oDesc.base * oDesc.porcentaje) / 100
				).toFixed(2);
			}
			dscRowToAppend =
				'<tr class="newrow" id="newrow"><td>' +
				rownumber +
				'</td><td>03000115</td><td>' +
				dscString +
				'</td><td>' +
				rowType +
				'</td><td>$-' +
				importe +
				'</td></tr>';
		}
	});
});

function getPreceOblg(parameters) {
	$('#modalCantidad').modal('hide');

	cantPOP = parseInt($('#popCantidad').val());

	if (cantPOP === 0 && reqCant == 1) {
		alert('La cantidad no puede ser igual a 0.');
		return false;
	}

	rownumber = $('#ITEMCONT').find('tr').last().find('td').first().text();

	rownumber++;

	getPrice(idServicio, cantPOP, function (precio) {
		if (cantPOP != 0) {
			$('#ITEMCONT tbody').append(
				'<tr class="newrow" id="newrow"><td>' +
					rownumber +
					'</td><td>' +
					idServicio +
					'</td><td>' +
					nombreServicio +
					' (Cant. ' +
					cantPOP +
					')</td><td>' +
					tipoServicio +
					'</td><td>$' +
					precio +
					'</td></tr>'
			);
		} else {
			$('#ITEMCONT tbody').append(
				'<tr class="newrow" id="newrow"><td>' +
					rownumber +
					'</td><td>' +
					idServicio +
					'</td><td>' +
					nombreServicio +
					'</td><td>' +
					tipoServicio +
					'</td><td>$' +
					precio +
					'</td></tr>'
			);
		}
	});

	preceRequest = $.ajax({
		url: '_ajax_configuracion_contrato.php?sp=precedencia',
		type: 'POST',
		data: parameters
	});

	preceRequest.done(function (precehtml) {
		$('#' + tipoServicio + ' tbody').append(precehtml);

		obligRequest = $.ajax({
			url:
				'_ajax_configuracion_contrato.php?sp=obligacion&cant=' +
				cantPOP +
				'&rownum=' +
				rownumber,
			type: 'POST',
			data: parameters
		});

		obligRequest.done(function (oblightml) {
			appendOblig(oblightml);
		});

		obligRequest.fail(function (jqXHR, textStatus) {
			console.log('Request obligRequest failed: ' + textStatus);
		});
	});

	preceRequest.fail(function (jqXHR, textStatus) {
		console.log('Request preceRequest failed: ' + textStatus);
	});
}

function appendOblig(oblightml) {
	$('#ITEMCONT tbody').append(oblightml);
	var idServicioObligado = $('#ITEMCONT tr').last().find('td').eq(1).text();
	if (oblightml.trim() != '') {
		rownumber++;
		getPrice(idServicioObligado, cantPOP);
	}
}

function getPrice(id, cant, callback) {
	priceRequest = $.ajax({
		url: '_ajax_configuracion_contrato.php?sp=precio',
		type: 'POST',
		data: {
			IN_CODIGO: id,
			IN_LISTAPRECIO: gListaPrecio
		}
	});

	priceRequest.done(function (precio) {
		var oServ = new objServicio(
			parseInt(rownumber),
			parseInt(id),
			parseFloat(precio),
			parseInt(cant)
		);
		listServicios.push(oServ);
		sumPrice();
		if (typeof callback !== 'undefined') {
			callback(precio);
		}
	});
}

confirmSaveHTML = '';

function closeModal(action, clienteID, usuarioID) {
	if (action === 'Save') {
		var dataCab = $('#formConfigurador').serializeArray();
		var allComplete = true;
		for (var i = 0; i < dataCab.length; i++) {
			$('#' + dataCab[i].name)
				.parent()
				.siblings('label')
				.removeClass('error');
			if (dataCab[i].value === '') {
				$('#' + dataCab[i].name)
					.parent()
					.siblings('label')
					.toggleClass('error');
				allComplete = false;
			}
		}
		if ($('#ITEMCONT #newrow').length <= 0) {
			allComplete = false;
		}
		if (allComplete === true) {
			confirmSaveHTML = $('.confirmSave').html();
			$('.confirmSave button').hide();
			$('.confirmSave .modal-body').append(
				'<img src="img/ajax-loader.gif">'
			);
			$('.confirmSave .modal-title').html('Guardando...');
			console.log('Saving...');
			status = saveConfChanges(clienteID, usuarioID);
			if (status == 0) {
				$('.confirmSave img').hide();
				$('#cnfSaveClose').show();
				$('.confirmSave .modal-title').html('Guardado!');
				//aca cargo la agenda
				Authorize('CARGAAGENDA', function (authorized) {
					sessionStorage.localidad = $('#IN_LOCALIDADINST')
						.find('option:selected')
						.attr('data-agenda'); //aca trae la localidad del cliente nuevo
					sessionStorage.clienteID =
						$('#IN_CLIENTE').attr('data-agenda'); //aca trae el codigo del cliente nuevo
					console.log(' AUTORIZACION RESULT' + authorized);
					if (authorized === 'T') {
						window.location.href = 'agenda.php';
						$('.confirmSave')
							.find('.modal-body')
							.find('span')
							.append(
								'<p style="background: aliceblue; font-size: 11pt; margin-top: 10px; margin-bottom: 0px; border-radius: 5px; box-shadow: 0px 0px 5px -2px blue inset; ">Si desea asignar una visita, pulse el botón<br><b>Ir a Agenda</b></p>'
							);
						$('#goToAgenda').show();
					} else {
						if (
							sessionStorage.localidad === 'BELEN DE ESCOBAR' ||
							sessionStorage.localidad === 'MATHEU'
						) {
							sessionStorage.localidad = 'BELEN DE ESCOBAR';
							sessionStorage.sucursal = '94';
							$('#goToAgenda').hide();
							GoToAgenda();
							$('#exitButton').on('click', function (event) {
								//event.preventDefault();
								//localStorage.setItem('dataReclamo', JSON.stringify(getAllInputs()));
								$('#exitButton').off('click');
								return false;
							});
						}

						if (sessionStorage.localidad === 'SAN NICOLAS') {
							sessionStorage.localidad = 'SAN NICOLAS';
							sessionStorage.sucursal = '84';
							$('#goToAgenda').hide();
							GoToAgenda();
							$('#exitButton').on('click', function (event) {
								//event.preventDefault();
								//localStorage.setItem('dataReclamo', JSON.stringify(getAllInputs()));
								$('#exitButton').off('click');
								return false;
							});
						}

						if (
							sessionStorage.localidad === 'MERCEDES' ||
							sessionStorage.localidad === 'GOWLAND'
						) {
							sessionStorage.localidad = 'MERCEDES';
							sessionStorage.sucursal = '92';
							$('#goToAgenda').hide();
							GoToAgenda();
							$('#exitButton').on('click', function (event) {
								//event.preventDefault();
								//localStorage.setItem('dataReclamo', JSON.stringify(getAllInputs()));
								$('#exitButton').off('click');
								return false;
							});
						}

						if (
							sessionStorage.localidad === 'LUJAN' ||
							sessionStorage.localidad === 'CORTINES' ||
							sessionStorage.localidad === 'JAUREGUI' ||
							sessionStorage.localidad === 'TORRES' ||
							sessionStorage.localidad === 'OPEN DOOR' ||
							sessionStorage.localidad === 'OLIVERA'
						) {
							sessionStorage.localidad = 'LUJAN';
							sessionStorage.sucursal = '88';
							$('#goToAgenda').hide();
							GoToAgenda();
							$('#exitButton').on('click', function (event) {
								//event.preventDefault();
								//localStorage.setItem('dataReclamo', JSON.stringify(getAllInputs()));
								$('#exitButton').off('click');
								return false;
							});
						}

						if (sessionStorage.localidad === 'GENERAL RODRIGUEZ') {
							sessionStorage.localidad = 'GENERAL RODRIGUEZ';
							sessionStorage.sucursal = '89';
							$('#goToAgenda').hide();
							GoToAgenda();
							$('#exitButton').on('click', function (event) {
								//event.preventDefault();
								//localStorage.setItem('dataReclamo', JSON.stringify(getAllInputs()));
								$('#exitButton').off('click');
								return false;
							});
						}

						if (sessionStorage.localidad === 'SUIPACHA') {
							sessionStorage.localidad = 'SUIPACHA';
							sessionStorage.sucursal = '93';
							$('#goToAgenda').hide();
							GoToAgenda();
							$('#exitButton').on('click', function (event) {
								//event.preventDefault();
								//localStorage.setItem('dataReclamo', JSON.stringify(getAllInputs()));
								$('#exitButton').off('click');
								return false;
							});
						}

						if (sessionStorage.localidad === 'FRANCISCO ALVAREZ') {
							sessionStorage.localidad = 'FRANCISCO ALVAREZ';
							sessionStorage.sucursal = '86';
							$('#goToAgenda').hide();
							GoToAgenda();
							$('#exitButton').on('click', function (event) {
								//event.preventDefault();
								//localStorage.setItem('dataReclamo', JSON.stringify(getAllInputs()));
								$('#exitButton').off('click');
								return false;
							});
						}

						if (
							sessionStorage.localidad === 'PILAR' ||
							sessionStorage.localidad === 'PRESIDENTE DERQUI' ||
							sessionStorage.localidad === 'DEL VISO' ||
							sessionStorage.localidad === 'VILLA ROSA'
						) {
							//sessionStorage.localidad = "PILAR";
							sessionStorage.sucursal = '87';
							$('#goToAgenda').hide();
							GoToAgenda();
							$('#exitButton').on('click', function (event) {
								//event.preventDefault();
								//localStorage.setItem('dataReclamo', JSON.stringify(getAllInputs()));
								$('#exitButton').off('click');
								return false;
							});
						}

						if (
							sessionStorage.localidad === 'MORENO' ||
							sessionStorage.localidad === 'LA REJA' ||
							sessionStorage.localidad === 'PASO DEL REY' ||
							sessionStorage.localidad === 'TRUJUI'
						) {
							sessionStorage.localidad = 'MORENO';
							sessionStorage.sucursal = '86';
							$('#goToAgenda').hide();
							GoToAgenda();
							$('#exitButton').on('click', function (event) {
								//event.preventDefault();
								//localStorage.setItem('dataReclamo', JSON.stringify(getAllInputs()));
								$('#exitButton').off('click');
								return false;
							});
						}
					}
				});
				///agenda
			} else {
				$('.confirmSave img').hide();
				$('#cnfSaveClose').show();
				$('.confirmSave .modal-title').html('Error, intente mas tarde');
			}
		} else {
			alert(
				'Complete los datos de cabecera y agregue al menos un servicio. Gracias!'
			);
		}
	}
	if (action === 'Exit') {
		if (confirmSaveHTML != '') {
			$('.confirmSave').html(confirmSaveHTML);
			$('.confirmSave').modal('hide');
			confirmSaveHTML = '';
		}
		$('#ITEMCONT #newrow').each(function () {
			$(this).remove();
		});
		$('#TVCABLE #newrow').each(function () {
			$(this).remove();
		});
		$('#DATOS #newrow').each(function () {
			$(this).remove();
		});
		$('#TELEFONIA #newrow').each(function () {
			$(this).remove();
		});
		$('#totalpl').text('0');
		listServicios = [];
		$('#modalConfg').modal('hide');
	}
}

function modalOnLoad(clienteID, listaPrecio) {
	gListaPrecio = listaPrecio;
	var oBody = $('#modalConfg .modal-body').html();
	$('#modalConfg').modal();
	$('#cnfSave').hide();
	$('#modalConfg .modal-body').html('');
	$('#modalConfg .modal-body').html(
		'<img src="img/ajax-loader.gif" style=" position: fixed; left: 50%; top: 50%;margin-left: -15px;">'
	);
	setTimeout(function () {
		var estadoRaw = $('#ContratoEstado').val();
		b = estadoRaw.match(/INST/gi);
		// b = estadoRaw.match(/activo/ig);
		if (b) {
			$('#modalConfg .modal-body').html(
				"<div class='ordenPendiente'><h3>El cliente no califica para una nueva configuracion de contrato</h3></div>"
			);
		} else {
			var getPendiente = $.ajax({
				url: '_ajax_configuracion_contrato.php?sp=getpendiente',
				type: 'POST',
				data: {
					IN_CODIGO: '"' + clienteID + '"'
				}
			});

			getPendiente.done(function (response) {
				if (response.trim() == '') {
					$('#modalConfg .modal-body').html(oBody);
					$('#cnfSave').show();
				} else {
					$('#modalConfg .modal-body').html(
						"<div class='ordenPendiente' style='margin-left: -225px;'><h3>El cliente tiene solicitudes pendientes.</h3></div>"
					);
				}
			});
		}
	}, 500);
}

function mdlDescBehaviors(action, usuarioSector) {
	switch (action) {
		case 'next':
			$('#mdldscNext').hide();
			mdldscInput = $('[name = "nroItem" ]').val();
			mdldscIdServicio = $('#ITEMCONT')
				.find('tr')
				.eq(parseInt(mdldscInput))
				.find('td:nth-child(2)')
				.text();
			mdldscSector = usuarioSector;
			mdldscParameters =
				'{ "IN_CODIGOSERVICIO" : "' +
				mdldscIdServicio +
				'" , "IN_SECTOR" : "' +
				mdldscSector +
				'" }';
			mdldscJSON = JSON.parse(mdldscParameters);

			$('.modalDescuentos .modal-body').html('');
			$('.modalDescuentos .modal-body').html(
				'<img src="img/ajax-loader.gif" style=" position: relative; left: 50%; top: 50%;margin-left: -15px;">'
			);

			console.log(mdldscInput);
			console.log(mdldscIdServicio);
			console.log(mdldscSector);
			console.log(mdldscParameters);

			var ajaxHandler = $.ajax({
				url: '_ajax_configuracion_contrato.php?sp=descuentos',
				type: 'POST',
				data: mdldscJSON
			});

			ajaxHandler.done(function (response) {
				var mdlDesc = $('.modalDescuentos');
				mdlDesc.css('width', '570px');
				mdlDesc.css('margin-left', '-285px');
				$('.modalDescuentos .modal-body').html(response);
				$('#mdldscSave').show();
			});
			break;
		case 'save':
			$('#ITEMCONT tbody').append(dscRowToAppend);
			$('.modalDescuentos').modal('hide');
			sumPrice();
			break;

		case 'exit':
			$('.modalDescuentos').modal('hide');
			break;

		default:
			console.log('Action not found');
	}
}

function saveConfChanges(clienteID, usuarioID) {
	var error = 0;

	IN_CLIENTE = clienteID;
	IN_USUARIO = usuarioID;
	IN_VENDEDOR =
		$('select[name="Vendedor"]').val() != ''
			? $('select[name="Vendedor"]').val()
			: 'null';
	IN_DETALLE = $('textarea[name="Detalle"]').val();
	IN_TIPOVENTA =
		$('select[name="TipoVenta"]').val() != ''
			? $('select[name="TipoVenta"]').val()
			: 'null';

	parameters = '';
	parameters =
		'{ "IN_SOLICITUD" : "' +
		IN_CLIENTE +
		'" , "IN_USUARIO" : "' +
		IN_USUARIO +
		'" , "IN_VENDEDOR" : "' +
		IN_VENDEDOR +
		'" ,  "IN_DETALLE" : "' +
		IN_DETALLE +
		'" , "IN_TIPOVENTA" : "' +
		IN_TIPOVENTA +
		'"}';
	parameters = parameters.replace(/\n/g, '. ');
	parsedParameters = '';
	parsedParameters = JSON.parse(parameters);

	cabeceraHandler = $.ajax({
		url: '_ajax_configuracion_contrato.php?sp=insertcabeceraalta',
		type: 'POST',
		data: parsedParameters
	});

	cabeceraHandler.done(function (response) {
		error = 0;

		var arrayInsert = [];
		$('#ITEMCONT tr[class="newrow"]').each(function () {
			var anterior = $(this).attr('data-ant');
			anterior = typeof anterior !== 'undefined' ? anterior : '';
			try {
				toInsert = {
					IN_IDALTA: clienteID,
					IN_CODIGOSERVICIO: $(this).find('td').eq(1).html(),
					IN_RUBRO: $(this).find('td').eq(3).html(),
					IN_ORDEN: $(this).find('td').eq(0).html(),
					IN_DESCRIPCION: $(this).find('td').eq(2).html()
				};
				arrayInsert.push(toInsert);
			} catch (ex) {
				console.warn(ex.message);
			}
		});

		detalleHandler = $.ajax({
			url: '_ajax_configuracion_contrato.php?sp=insertdetallealta',
			type: 'POST',
			data: {
				stringified: JSON.stringify(arrayInsert)
			}
		});

		detalleHandler.done(function (response) {
			$('#modalConfExit').modal('show');
			console.log('Detalle Insertado');
			console.log(response);
			if (response === 'OK') {
				error = 0;
			} else {
				error = 1;
			}
			setTimeout(function () {
				window.location.reload();
			}, 2000);
		});
	});
	return error;
}

function pad(str, max) {
	str = str.toString();
	return str.length < max ? pad('0' + str, max) : str;
}

$('.localidad1').livequery(function () {
	$(this).on('change', function () {
		var localidad = $(this).find('option:selected').val();
		if (localidad !== '') {
			getCalle(localidad, 1);
		}
	});
});
$('.localidad2').livequery(function () {
	$(this).on('change', function () {
		var localidad = $(this).find('option:selected').val();
		if (localidad !== '') {
			getCalle(localidad, 2);
		}
	});
});
$('#CONFIRMACION').livequery(function () {
	$(this).on('change', function () {
		$('#btnconf').toggleClass('hide');
	});
});
function getCalle(idCiudad, idCalle, callback) {
	$.ajax({
		url: '_ajax_getCalle.php',
		type: 'POST',
		data: { id: idCiudad }
	})
		.done(function (data) {
			$('.calle' + idCalle).html(data);
			if (typeof callback !== 'undefined') {
				callback();
			} else {
				console.info('callback undefined');
			}
		})
		.fail(function () {
			console.log('error calle ' + idCalle);
		})
		.always(function () {
			console.log('complete calle ' + idCalle);
		});
}
function submitConfirmacion() {
	Authorize('ALTACONTRATO', function (authorized) {
		if (authorized === 'T') {
			var inputs = $('#formConfirmacion').serializeArray();
			var allComplete = true;
			for (var i = 0; i < inputs.length; i++) {
				$('#' + inputs[i].name)
					.parent()
					.siblings('label')
					.removeClass('error');
				if (inputs[i].value === '') {
					$('#' + inputs[i].name)
						.parent()
						.siblings('label')
						.toggleClass('error');
					allComplete = false;
				}
			}
			if (allComplete === true) {
				$('#mdload').modal('show');
				$.post(
					'solicitudes_editar_confirmar.php',
					$('#formConfirmacion').serialize()
				).done(function (data) {
					setTimeout(function () {
						$('#mdload').modal('hide');
					}, 1000);
					var href = window.location.href;
					window.location.href = href;
				});
			}
		} else {
			$('#errorPermiso').modal('show');
		}
	});
}

function submitAlta() {
	Authorize('ALTACONTRATO', function (authorized) {
		if (authorized === 'T') {
			$.getJSON(
				'_ajax_consulta_dni.php',
				{ dni: $('#formAlta #IN_NUMERODOCUMENTO').val() },
				function (responseDni) {
					if (responseDni.length > 0) {
						swal(
							{
								title: 'El DNI ingresado tiene clientes asociados',
								text:
									'Codigo del o los cliente/s existente/s "' +
									_.join(_.map(responseDni, 'CODIGO'), ', ') +
									'"',
								type: 'warning',
								showCancelButton: true,
								cancelButtonText: 'Cancelar',
								confirmButtonText: 'Ok, continuar!'
							},
							function () {
								submitAltaConfirm();
							}
						);
						return;
					} else {
						submitAltaConfirm();
					}
				}
			);
		} else {
			$('#errorPermiso').modal('show');
		}
	});
}

function submitAltaConfirm() {
	$(':input[required]').parent().siblings('label').removeClass('error');
	if ($('#errorRequired').css('display') !== 'none') {
		$('#errorRequired').toggleClass('hide');
	}
	var requiredComplete = true;
	var postData =
		$('#formAlta').serialize() + '&' + $('#formConfirmacion').serialize();
	var postArray = $('#formAlta :input[required]')
		.serializeArray()
		.concat($('#formConfirmacion :input[required]').serializeArray());
	for (var i = 0; i < postArray.length; i++) {
		if (postArray[i].value === '') {
			$('#' + postArray[i].name)
				.parent()
				.siblings('label')
				.toggleClass('error');
			requiredComplete = false;
		}
	}

	if (
		$('#IN_NUMEROFACT')
			.val()
			.match(/^([\d])+$/gim) === null
	) {
	}
	var currentValue = $('#IN_NUMERODOCUMENTO').val();
	var currentTipo = $('#IN_TIPODOCUMENTO').val();
	var pasaporteRegExp = new RegExp(/^[0-9a-zA-Z]{7,9}$/i);
	var dniRegExp = new RegExp(/^[\d]{1,2}[\d]{3,3}[\d]{3,3}$/i);

	if (currentTipo == '{77DD216A-4AE0-11D5-BB55-00508BFC5002}') {
		// Pasaporte
		var regExpDocumento = pasaporteRegExp;
	}
	if (currentTipo == '{77DD2164-4AE0-11D5-BB55-00508BFC5002}') {
		// DNI
		var regExpDocumento = dniRegExp;
	}
	if (currentTipo == '') {
		// NO seleccionó un tipo
		requiredComplete = false;
		swal('Atención', 'Seleccioná el tipo de documento', 'warning');
		return;
	}
	if (regExpDocumento.test(currentValue)) {
		// válido
	} else {
		// no válido
		requiredComplete = false;
		swal('Atención', 'Verificá el documento', 'warning');
		return;
	}

	if (
		$('#IN_NUMEROFACT')
			.val()
			.match(/^([\d])+$/gim) === null
	) {
		requiredComplete = false;
	}
	if (
		$('#IN_NUMEROINST')
			.val()
			.match(/^([\d])+$/gim) === null
	) {
		requiredComplete = false;
	}

	if (
		$('#IN_NUMEROINST')
			.val()
			.match(/^([\d])+$/gim) === null
	) {
		requiredComplete = false;
	}

	var fechNac = moment($('#IN_FECHANACIMIENTO').val(), 'DD/MM/YYYY');
	var mayorDeEdad = moment().subtract(18, 'years');

	if (!fechNac.isBefore(mayorDeEdad)) {
		requiredComplete = false;
		swal(
			'Atención',
			'La fecha de nacimiento ingresada no corresponde a una persona mayor de 18 años',
			'warning'
		);
	}
	/* editado nmadera 120520
    var numTel = $('#NUMEROTEL').val();
    if (numTel.length < 8) {
        requiredComplete = false;
        swal('Atención', 'El número de teléfono esta incompleto. Recuerde poner caracteristica local + número', 'warning');
    }

    */

	//actualizacion 13/11/2020 nmadera
	var cuit = String($('#IN_CUIT').val());
	var tipoIva = String($('#IN_TIPOIVA').val());

	console.log(cuit);
	console.log(tipoIva);

	if (tipoIva != '{6D0F3B32-5C36-11D5-BB6A-00508BFC5002}') {
		if (cuit === '0' || cuit === '00-00000000-0' || cuit === '') {
			requiredComplete = false;
			swal(
				'Atención',
				'Por el tipo de IVA seleccionado, el CUIT no puede ser nulo.',
				'warning'
			);
		}
	}

	var Afijo = document.getElementById('IN_NUMEROFIJOAREA').value;
	var fijo = document.getElementById('IN_NUMEROFIJO').value;
	var Amovil = document.getElementById('IN_NUMEROMOVILAREA').value;
	var movil = document.getElementById('IN_NUMEROMOVIL').value;
	var AmovilALT = document.getElementById('IN_NUMEROMOVILAREAALT').value;
	var movilALT = document.getElementById('IN_NUMEROMOVILALT').value;

	var email = $('#IN_MAIL').val();
	console.log(email);
	/*
    if(email===''){
        requiredComplete = false;
        swal('Atención', 'Se requiere un mail de contacto.', 'warning');
    }
*/

	if (
		Afijo + fijo == '' &&
		Amovil + movil == '' &&
		AmovilALT + movilALT == ''
	) {
		requiredComplete = false;
		swal(
			'Atención',
			'Debe ingresar al menos un numero de contacto. Recuerde poner caracteristica local + número',
			'warning'
		);
	}

	if (Afijo.length != 0) {
		if (fijo == '') {
			requiredComplete = false;
			swal('Atención', 'Verifique el telefono ingresado', 'warning');
		}
		if (Afijo.length < 3) {
			requiredComplete = false;
			swal('Atención', 'Verifique el telefono ingresado', 'warning');
		}
	}
	if (Amovil.length != 0) {
		if (movil == '') {
			requiredComplete = false;
			swal('Atención', 'Verifique el telefono ingresado', 'warning');
		}
		if (Amovil.length < 2) {
			requiredComplete = false;
			swal('Atención', 'Verifique el telefono ingresado', 'warning');
		}
	}
	if (AmovilALT.length != 0) {
		if (movilALT == '') {
			requiredComplete = false;
			swal('Atención', 'Verifique el telefono ingresado', 'warning');
		}
		if (AmovilALT.length < 2) {
			requiredComplete = false;
			swal('Atención', 'Verifique el telefono ingresado', 'warning');
		}
	}

	if (fijo.length != 0) {
		if (Afijo == '') {
			requiredComplete = false;
			swal('Atención', 'Verifique el telefono ingresado', 'warning');
		}
		if (fijo.length < 6) {
			requiredComplete = false;
			swal('Atención', 'Verifique el telefono ingresado', 'warning');
		}
	}
	if (movil.length != 0) {
		if (Amovil == '') {
			requiredComplete = false;
			swal('Atención', 'Verifique el telefono ingresado', 'warning');
		}
		if (movil.length < 6) {
			requiredComplete = false;
			swal('Atención', 'Verifique el telefono ingresado', 'warning');
		}
	}
	if (movilALT.length != 0) {
		if (AmovilALT == '') {
			requiredComplete = false;
			swal('Atención', 'Verifique el telefono ingresado', 'warning');
		}
		if (movilALT.length < 6) {
			requiredComplete = false;
			swal('Atención', 'Verifique el telefono ingresado', 'warning');
		}
	}

	// Validaciones de pago
	console.log('isValidCard', isValidCard);
	if ($('#IN_FORMAPAGO').val() === idCuentaCorriente && !isValidCbu) {
		requiredComplete = false;
		return;
	}
	// Validaciones de pago
	if ($('#IN_FORMAPAGO').val() === idDebito && !isValidCard) {
		requiredComplete = false;
		return;
	}

	//verifico si no cargo mail
	var checkBox = document.getElementById('checkMail');
	if (!checkBox.checked) {
		console.log(checkBox.checked);
		var email = $('#email').val();
		if (email === '') {
			requiredComplete = false;
			swal('Atención', 'Se requiere un mail de contacto.', 'warning');
		}
	}
	var IN_USUARIO = $('#usu').val();
	console.log('IN_USUARIO', IN_USUARIO);
	if (requiredComplete) {
		$('#mdload').modal('show');
		$.post('solicitudes_editar_crear.php', postData).done(function (data) {
			var id = JSON.parse(data);
			id = id.aID;
			if (checkBox.checked) {
				var urlString =
					'./_ajax_log_noPoseeMail.php?IN_USUARIO=' +
					IN_USUARIO +
					'&IN_ID_ACP=' +
					id;
				$.ajax({
					url: urlString,
					success: function (data) {
						console.log('registrado en el log de no posee mail');
					}
				});
			}
			$('#mdload').modal('hide');
			var url = 'solicitudes_editar.php?id_solicitud=' + id;
			window.location.href = url;
		});
	} else {
		$('#errorRequired').toggleClass('hide');
	}
}

function modoContrato(modo) {
	$('.contrato-start').hide();
	switch (modo) {
		case 'configurador':
			$('.contrato-configurador').show();
			break;
		case 'combos':
			$('.contrato-combos').show();
			break;
		default:
			$('.contrato-configurador').hide();
			$('.contrato-combos').hide();
			$('.contrato-start').show();
			break;
	}
}
function submitPaquetes() {
	var dataPaq = $('#formPaquetes').serializeArray();
	var dataCab = $('#formCabeceraPaquetes').serializeArray();
	var allComplete = true;
	for (var i = 0; i < dataCab.length; i++) {
		$('#' + dataCab[i].name)
			.parent()
			.siblings('label')
			.removeClass('error');
		if (dataCab[i].value === '') {
			$('#' + dataCab[i].name)
				.parent()
				.siblings('label')
				.toggleClass('error');
			allComplete = false;
		}
	}
	if (allComplete === true && dataPaq.length > 0) {
		productos = null;
		getProductos(function (data) {
			productos = data.trim() !== '' ? JSON.parse(data) : null;
			if (productos != null) {
				insertCabecera(dataCab, function (response) {
					var paquetes = [];
					for (var i = 0; i < dataPaq.length; i++) {
						for (var x = 0; x < productos.length; x++) {
							if (productos[x].codigo === dataPaq[i].value) {
								var detalle = {
									IN_ALTA: 'ID_MOD',
									IN_CODIGOSERVICIO: productos[x].codigo,
									IN_RUBRO: productos[x].rubro,
									IN_ORDEN: productos[x].orden,
									IN_DESCRIPCION: productos[x].descripcion
								};
								paquetes.push(detalle);
								break;
							}
						}
					}
					insertDetalle(paquetes);
				});
			}
		});
	} else if (dataPaq.length <= 0) {
		alert('Seleccione al menos un producto');
	}
}

function insertCabecera(datacab, callback) {
	$.post('solicitudes_editar_paquetes.php?p=cabecera', datacab).done(
		function (data) {
			if (typeof callback !== 'undefined') {
				callback(data);
			}
		}
	);
}

function insertDetalle(paquetes) {
	$.post('solicitudes_editar_paquetes.php?p=detalle', {
		paquetes: JSON.stringify(paquetes)
	}).done(function (data) {
		$('#modalConfExit').modal('show');
		setTimeout(function () {
			window.location.reload();
		}, 1000);
	});
}

function getProductos(callback) {
	$.post('solicitudes_editar_paquetes.php?p=descripcion').done(function (
		data
	) {
		if (typeof callback !== 'undefined') {
			callback(data);
		}
	});
}

$('#InstaFact').livequery(function () {
	$(this).on('change', function () {
		if (typeof $(this).attr('checked') !== 'undefined') {
			$('#IN_LOCALIDADFACT').val($('#IN_LOCALIDADINST').val());
			getCalle($('#IN_LOCALIDADINST').val(), 1, function () {
				$('#IN_CALLEFACT').val($('#IN_CALLEINST').val());
				$('#IN_ENTRECALLE1').val($('#IN_ENTRECALLE12').val());
				$('#IN_ENTRECALLE2').val($('#IN_ENTRECALLE22').val());
			});
			$('#IN_NUMEROFACT').val($('#IN_NUMEROINST').val());
			$('#IN_PISOFACT').val($('#IN_PISOINST').val());
			$('#IN_PUERTAFACT').val($('#IN_PUERTAINST').val());
			$('#IN_CPFACT').val($('#IN_CPINST').val());
			$('#IN_TORREFACT').val($('#IN_TORREINST').val());
		}
	});
});

$('#IN_FORMAPAGO').livequery(function () {
	$(this).on('change', function () {
		// $('#IN_TARJETATIPO').removeAttr('disabled');
		$('#TARJETANUMERO').removeAttr('disabled');
		if ($(this).find('option:selected').text().trim() === 'Efectivo') {
			$('#IN_TARJETATIPO').attr('disabled', 'disabled');
			$('#TARJETANUMERO').attr('disabled', 'disabled');
		}
	});
});

$('#confContrato').livequery(function () {
	$(this).on('change', function () {
		$('#formConfigurador :input').prop('disabled', !this.checked);
		$('#btnGuardarConf').prop('disabled', !this.checked);
	});
	$('#formConfigurador :input').prop('disabled', !this.checked);
	$('#btnGuardarConf').prop('disabled', !this.checked);
});

$('#IN_MAIL').livequery(function () {
	$(this).on('keyup', function () {
		if ($(this).val().trim() !== '') {
			$('#IN_TIPOMAIL').attr('required', 'True');
		} else {
			$('#IN_TIPOMAIL').removeAttr('required');
		}
	});
});

//--------------------------------------------------
// CREDIT CARD VALIDATIONS
var visa = new RegExp('^4[0-9]{12}(?:[0-9]{3})?$');
var visaFormat = new RegExp('^4[0-9]');

var americanExpress = new RegExp('^3[47][0-9]{13}$');
var americanExpressFormat = new RegExp('^3[47]');

var masterCard = new RegExp(
	'^(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}$'
);
var masterCardFormat = new RegExp(
	'^(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)'
);

var cabal = new RegExp('^(5896|6042){1}[0-9]{12}$');
var cabalFormat = new RegExp('^(5896|6042)');

isValidCard = false;

function cardNumberInputValidation() {
	var cardSelected = document.querySelector('#IN_TARJETATIPO');
	$('#TARJETANUMERO').on('keyup', function (e) {
		cardInputFormatter(e);
		cardTypeFormatter($('#TARJETANUMERO').val(), cardSelected);
		validateCard();
	});
}

function validateCardNumber(creditCardNumber) {
	var stringNum = creditCardNumber.toString();
	var reversedNum = stringNum.split('').reverse();
	var sum = 0;
	for (let i = 0; i < reversedNum.length; i++) {
		var digit = parseInt(reversedNum[i]);
		if (i % 2 !== 0) {
			var doubledDigit = digit * 2;
			sum += doubledDigit > 9 ? doubledDigit - 9 : doubledDigit;
		} else {
			sum += digit;
		}
	}
	var response = sum % 10 === 0;
	return response;
}

function checkCardType(cardType, creditCardNumber) {
	switch (true) {
		case cardType == '{9F7B09AE-7ED6-42E7-BB2C-68B6507EC320}' &&
			visa.test(creditCardNumber) &&
			validateCardNumber(creditCardNumber):
		case cardType == '{D91126A0-F160-4AD6-A303-07CF798143B4}' &&
			americanExpress.test(creditCardNumber) &&
			validateCardNumber(creditCardNumber):
		case cardType == '{DB4F4E9C-E06F-4F5B-BEB5-FF86F9B47FB7}' &&
			masterCard.test(creditCardNumber) &&
			validateCardNumber(creditCardNumber):
		case cardType == '{0C0CF4E3-A0C8-4A56-BE64-517659629094}' &&
			cabal.test(creditCardNumber) &&
			validateCardNumber(creditCardNumber):
			return true;
		default:
			return false;
	}
}

function cardTypeFormatter(creditCardNumber, cardElement) {
	switch (true) {
		case visaFormat.test(creditCardNumber):
			cardElement[5].selected = true;
			break;
		case americanExpressFormat.test(creditCardNumber):
			cardElement[1].selected = true;
			break;
		case masterCardFormat.test(creditCardNumber):
			cardElement[2].selected = true;
			cardElement[2].text = 'MasterCard';
			break;
		case cabalFormat.test(creditCardNumber):
			cardElement[3].selected = true;
			break;
		default:
			cardElement[0].selected = true;
			break;
	}
}

function cardInputFormatter(cardTextValue) {
	if (americanExpressFormat.test($('#TARJETANUMERO').val())) {
		cardTextValue.target.value = cardTextValue.target.value
			.replace(/[^\d]/g, '')
			.replace(/(\d{4})\s*(\d{6})?\s*(\d{5})?/, '$1 $2 $3')
			.replace(/\s\s/g, ' ');
		document.querySelector('#TARJETANUMERO').maxLength = '17';
	} else {
		cardTextValue.target.value = cardTextValue.target.value
			.replace(/[^\d]/g, '')
			.replace(/(.{4})/g, '$1 ')
			.replace(/^\s+|\s+$/gm, '');
		document.querySelector('#TARJETANUMERO').maxLength = '19';
	}
}

function validateCard() {
	var cardTypeSelected = $('[name=IN_TARJETATIPO] option:selected')
		.val()
		.trim();
	var cardNumber = $('#TARJETANUMERO').val().replace(/\s+/g, '');
	var validCard = checkCardType(cardTypeSelected, cardNumber);
	if (validCard) {
		showSuccessInput($('#TARJETANUMERO'));
		isValidCard = true;
	}
	if (!validCard) {
		showErrorInput($('#TARJETANUMERO'));
		isValidCard = false;
	}
}

// --------------------
//Validacion de CBU
var cbu = document.querySelector('#IN_NUMEROCBU');
isValidCbu = false;

function cbuInputValidation() {
	document.querySelector('#IN_NUMEROCBU').maxLength = '22';
	$('#IN_NUMEROCBU').on('keyup', (e) => {
		e.target.value = e.target.value.replace(/[^\d]/, '');
		validateCbu();
	});
}

function validateCbu() {
	var cbu = $('#IN_NUMEROCBU');
	if (validarCBU(cbu.val())) {
		showSuccessInput(cbu);
		isValidCbu = true;
	} else {
		showErrorInput(cbu);
		isValidCbu = false;
	}
}

function validarCBU(cbu) {
	var banco = cbu.substr(0, 3);
	if (cbu.length != 22) return false;

	var arr = cbu.split('');
	if (arr[7] != getDigitoVerificador(arr, 0, 6)) return false;
	if (arr[21] != getDigitoVerificador(arr, 8, 20)) return false;
	if (banco === '000') return false;

	return true;
}

function getDigitoVerificador(numero, posInicial, posFinal) {
	ponderador = Array.from([3, 1, 7, 9]);
	suma = 0;
	j = 0;
	for (var i = posFinal; i >= posInicial; i--) {
		suma = suma + numero[i] * ponderador[j % 4];
		j++;
	}
	return (10 - (suma % 10)) % 10;
}

// Error classes
function showErrorInput(element) {
	element.parents('.control-group').removeClass('error');
	element.parents('.control-group').removeClass('success');
	element.parents('.control-group').addClass('error');
}

function showSuccessInput(element) {
	element.parents('.control-group').removeClass('error');
	element.parents('.control-group').removeClass('success');
	element.parents('.control-group').addClass('success');
}

//agenda instalacion
function GoToAgenda() {
	window.location.href = 'agenda_inst.php';
}
/////////////////////////
