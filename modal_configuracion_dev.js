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
			// $('#ITEMCONT').html("<thead><tr><th></th><th>CODIGO</th><th>DESCRIPCION</th><th>TIPO_SERVICIO</th><th>PRECIO</th></tr></thead><tbody></tbody>");
			$('#ITEMCONT').html(
				'<thead><tr><th></th><th>CODIGO</th><th>DESCRIPCION</th><th>TIPO_SERVICIO</th><th>PRECIO</th><th>FECHA_INICIO</th><th>FECHA_FIN</th></tr></thead><tbody></tbody>'
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
				url: '_ajax_configuracion_contrato_dev.php?sp=cantidad',
				type: 'POST',
				data: {
					id: idServicio
				}
			});

			chkCantResponse.done(function (requiereCantidad) {
				reqCant = requiereCantidad;
				if (requiereCantidad == 1) {
					$('#popCantidad').val('0');
					$('#btnMC').click();
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
				') ';
			rownumber = $('#ITEMCONT')
				.find('tr')
				.last()
				.find('td')
				.first()
				.text();
			rownumber++;
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
				'<tr class="newrow" data-ant="' +
				mdldscAnt +
				'" id="newrow"><td>' +
				rownumber +
				'</td><td>03000115</td><td>' +
				dscString +
				'</td><td>' +
				rowType +
				'</td><td>$-' +
				importe +
				'</td>';
		}
	});
});

function getPreceOblg(parameters) {
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
		url: '_ajax_configuracion_contrato_dev.php?sp=precedencia',
		type: 'POST',
		data: parameters
	});

	preceRequest.done(function (precehtml) {
		$('#' + tipoServicio + ' tbody').append(precehtml);

		obligRequest = $.ajax({
			url:
				'_ajax_configuracion_contrato_dev.php?sp=obligacion&cant=' +
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
		console.info(oblightml);
		rownumber++;
		getPrice(idServicioObligado, cantPOP);
	}
}

function getPrice(id, cant, callback) {
	priceRequest = $.ajax({
		url: '_ajax_configuracion_contrato_dev.php?sp=precio',
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
		confirmSaveHTML = $('.confirmSave').html();
		$('.confirmSave button').hide();
		$('.confirmSave .modal-body').append('<img src="img/ajax-loader.gif">');
		$('.confirmSave .modal-title').html('Guardando...');
		console.log('Saving...');
		console.log(sessionStorage.localidad);
		status = saveConfChanges(clienteID, usuarioID);
		//alert('status: '.status);
		if (status == 0) {
			$('.confirmSave img').hide();
			$('#cnfSaveClose').show();
			$('.confirmSave .modal-title').html('¡Guardado!');
			//aca cargo la agenda
			//alert('hasOnlyDesc: '.hasOnlyDesc);
			if (!hasOnlyDesc) {
				console.log('entro en agenda');
				Authorize('CARGAAGENDA', function (authorized) {
					console.log(' AUTORIZACION RESULTTTT' + authorized);
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
						//if (sessionStorage.localidad === "BELEN DE ESCOBAR" && ($("#IDSectorJS").val() === "038" || $("#IDSectorJS").val() === "040" || $("#IDSectorJS").val() === "004")) {
						if (sessionStorage.localidad === 'BELEN DE ESCOBAR') {
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
				console.log('no entro en agenda');
			}
		} else {
			$('.confirmSave img').hide();
			$('#cnfSaveClose').show();
			$('.confirmSave .modal-title').html('Error, intente mas tarde');
		}
		//alert('termino de procesar el descuento');
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
	Authorize('CONFIGURADOR_CONTRATO', function (authorized) {
		if (authorized === 'T') {
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
						url: '_ajax_configuracion_contrato_dev.php?sp=getpendiente',
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
		} else {
			$('#errorPermiso').modal('show');
		}
	});
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
			var dataID = $('#ITEMCONT')
				.find('tr')
				.eq(parseInt(mdldscInput))
				.attr('data-id');
			mdldscAnt =
				typeof dataID !== 'undefined' && dataID.trim() !== ''
					? dataID
					: '';
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

			console.log('mdldscJSON', mdldscJSON);
			var ajaxHandler = $.ajax({
				url: '_ajax_configuracion_contrato_dev.php?sp=descuentos',
				type: 'POST',
				data: mdldscJSON
			});

			ajaxHandler.done(function (response) {
				var mdlDesc = $('.modalDescuentos');
				mdlDesc.css('width', '570px');
				mdlDesc.css('margin-left', '-285px');
				$('.modalDescuentos .modal-body').html(response);
				if (mdldscIdServicio === '03000325') {
					// console.log('Descuento de HBO TRIMI');
					$('#modalDescuentos').find('tbody tr:nth-child(2)').hide();
				}
				$('#mdldscSave').show();
				console.log('btn retencion');
				var x = document.getElementById('mdlBtnRet');
				x.style.display = 'block';
			});
			break;
		case 'save':
			if (mdldscIdServicio === '03000325') {
				// console.log('Descuento de HBO TRIMI');
				hboDiscountDates();
				$('#ITEMCONT tbody').append(dscRowToAppend);
				$('#modalDescuentos').find('tbody tr:nth-child(2)').dblclick();

				let dtUltimaFecha = new Date($('#fechafin').val());
				let yearUltimaFecha = dtUltimaFecha.getFullYear();
				let monthUltimaFecha = dtUltimaFecha.getMonth();
				let ultimaFecha = formatDate(
					new Date(yearUltimaFecha, monthUltimaFecha, 0)
				);

				dscRowToAppend =
					dscRowToAppend +
					'<td>' +
					ultimaFecha +
					'</td><td>' +
					formatDate(
						new Date(yearUltimaFecha, monthUltimaFecha + 2, 0)
					) +
					'</td></tr>';
				$('#ITEMCONT tbody').append(dscRowToAppend);
			} else {
				dscRowToAppend = dscRowToAppend + '</tr>';
				$('#ITEMCONT tbody').append(dscRowToAppend);
			}

			$('.modalDescuentos').modal('hide');
			sumPrice();
			var x = document.getElementById('mdlBtnRet');
			x.style.display = 'none';
			var x = document.getElementById('cnfSave');
			x.style.display = 'inline-block';
			var y = document.getElementById('cnfCerrar');
			y.style.display = 'inline-block';
			break;

		case 'exit':
			$('.modalDescuentos .modal-header .modal-title').html('Descuentos');
			$('#modalFechaRet').modal('hide');
			$('#mdldscSaveRet').modal('hide');
			$('.modalDescuentos .modal-body2').html('');
			$('.modalDescuentos .modal-body').show();
			$('.modalDescuentos').modal('hide');
			var x = document.getElementById('mdlBtnRet');
			x.style.display = 'none';
			var y = document.getElementById('mdldscSaveRet');
			y.style.display = 'none';
			var x = document.getElementById('cnfSave');
			x.style.display = 'inline-block';
			var y = document.getElementById('cnfCerrar');
			y.style.display = 'inline-block';
			break;

		default:
			console.log('Action not found');
	}
}

function mdlRetBehaviors(action, usuarioSector) {
	switch (action) {
		case 'next':
			$('#mdldscNext').hide();
			mdldscIdServicio = $('#ITEMCONT')
				.find('tr')
				.eq(parseInt(mdldscInput))
				.find('td:nth-child(2)')
				.text();
			var dataID = $('#ITEMCONT')
				.find('tr')
				.eq(parseInt(mdldscInput))
				.attr('data-id');
			mdldscAnt =
				typeof dataID !== 'undefined' && dataID.trim() !== ''
					? dataID
					: '';
			mdldscSector = usuarioSector;
			mdldscParameters =
				'{"IN_CODIGOSERVICIO" : "' +
				mdldscIdServicio +
				'"  , "IN_SECTOR" : "' +
				mdldscSector +
				'" }';
			mdldscJSON = JSON.parse(mdldscParameters);

			$('.modalDescuentos .modal-body').html('');
			$('.modalDescuentos .modal-body').html(
				'<img src="img/ajax-loader.gif" style=" position: relative; left: 50%; top: 50%;margin-left: -15px;">'
			);

			var ajaxHandler = $.ajax({
				url: '_ajax_configuracion_contrato_dev.php?sp=descuentos',
				type: 'POST',
				data: mdldscJSON
			});

			ajaxHandler.done(function (response) {
				var mdlDesc = $('.modalDescuentos');
				mdlDesc.css('width', '570px');
				mdlDesc.css('margin-left', '-285px');
				$('.modalDescuentos .modal-body').hide();
				$('.modalDescuentos .modal-body2').html(response);
			});
			break;
		case 'save':
			dscRowToAppend =
				dscRowToAppend +
				'<td>' +
				$('#fechainicio').val() +
				'</td><td>' +
				$('#fechafin').val() +
				'</td></tr>';
			$('#ITEMCONT tbody').append(dscRowToAppend);
			$('.modalDescuentos').modal('hide');
			var x = document.getElementById('cnfSave');
			x.style.display = 'inline-block';
			var y = document.getElementById('cnfCerrar');
			y.style.display = 'inline-block';
			console.log(dscRowToAppend);
			sumPrice();
			break;
		case 'exitFecha':
			$('#modalFechaRet').modal('hide');
			break;
		case 'saveFecha':
			var fechainicio = $('#fechainicio').val();
			var fechafin = $('#fechafin').val();

			let dt = new Date();
			let year = dt.getFullYear();
			let month = dt.getMonth() - 2;
			let day = dt.getDate();
			let today = formatDate(new Date(year, month, day));

			console.log(today + ' dias nico');

			if (fechainicio < today) {
				swal(
					'No debe seleccionar una fecha de inicio anterior a dos meses.'
				);
			} else {
				if (fechafin > fechainicio) {
					if (fechainicio === '' || fechafin === '') {
						swal(
							'Es obligatorio seleccionar la fecha de inicio y fin de la retención.'
						);
					} else {
						$('#modalFechaRet').modal('hide');
					}
				} else {
					swal('Verifique las fechas seleccionadas.');
				}
			}
			break;
		case 'exit':
			$('.modalDescuentos .modal-header .modal-title').html('Descuentos');
			$('#modalFechaRet').modal('hide');
			$('.modalDescuentos .modal-body2').html('');
			$('.modalDescuentos .modal-body').html('');
			$('.modalDescuentos').modal('hide');
			var x = document.getElementById('mdlBtnRet');
			var y = document.getElementById('mdldscSaveRet');
			y.style.display = 'none';
			x.style.display = 'none';

			break;

		default:
			console.log('Action not found');
	}
}

function btnRetencion(action, usuarioSector) {
	var x = document.getElementById('cnfSave');
	x.style.display = 'none';
	var y = document.getElementById('cnfCerrar');
	y.style.display = 'none';

	$('.modalDescuentos .modal-header .modal-title').html('Descuentos');
	$('.modalDescuentos .modal-body').html('');
	document.getElementById('mdlBtnRet').style.display = 'none';
	var x = document.getElementById('mdldscSave');
	var y = document.getElementById('mdldscSaveRet');
	console.log(x);
	x.style.display = 'none';
	y.style.display = 'inline-block';
	mdlRetBehaviors(action, usuarioSector);
}

var hasOnlyDesc = true;
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
	IN_INIFECHARET =
		$('#fechainicio').val() != '' ? $('#fechainicio').val() : '';
	IN_FINFECHARET = $('#fechafin').val() != '' ? $('#fechafin').val() : '';
	console.log(IN_INIFECHARET);
	console.log(IN_FINFECHARET);

	oParams = {
		IN_CLIENTE: IN_CLIENTE,
		IN_USUARIO: IN_USUARIO,
		IN_VENDEDOR: IN_VENDEDOR,
		IN_DETALLE: IN_DETALLE,
		IN_TIPOVENTA: IN_TIPOVENTA
	};

	parsedParameters = oParams;
	console.log(oParams);

	cabeceraHandler = $.ajax({
		url: '_ajax_configuracion_contrato_dev.php?sp=insertcabecera',
		type: 'POST',
		data: parsedParameters
	});

	cabeceraHandler.done(function (response) {
		console.log($('#fechainicio').val());
		error = 0;
		$('#fechainicio').val('');
		$('#fechafin').val('');
		jsonResponse = JSON.parse(response);
		console.log(jsonResponse);
		if (jsonResponse.ID_MOD != '') {
			var ID_CONT_MOD = jsonResponse.ID_MOD;
			console.log('Cabecera Insertada');
			console.log(response);
			console.log('ID_CONT_MOD', ID_CONT_MOD);
		} else {
			error = 1;
		}

		var arrayInsert = [];
		$('#ITEMCONT tr[class="newrow"]').each(function () {
			var anterior = $(this).attr('data-ant');
			anterior = typeof anterior !== 'undefined' ? anterior : '';

			var fechainiciosave = $(this).find('td').eq(5).html();
			fechainiciosave =
				typeof fechainiciosave !== 'undefined' ? fechainiciosave : '';
			var fechafinsave = $(this).find('td').eq(6).html();
			fechafinsave =
				typeof fechafinsave !== 'undefined' ? fechafinsave : '';

			if (hasOnlyDesc) {
				hasOnlyDesc = $(this).find('td').eq(1).html() === '03000115';
				//alert('se cargaron sólo descuentos.');
			}

			try {
				toInsert = {
					IN_ALTA: jsonResponse.ID_MOD,
					IN_CODIGOSERVICIO: $(this).find('td').eq(1).html(),
					IN_RUBRO: $(this).find('td').eq(3).html(),
					IN_ORDEN: $(this).find('td').eq(0).html(),
					IN_DESCRIPCION: $(this).find('td').eq(2).html(),
					IN_ITEM_CONTRATO_ANT: anterior,
					IN_INIFECHARET: fechainiciosave,
					IN_FINFECHARET: fechafinsave
				};
			} catch (ex) {
				console.warn(ex.message);
			}
			arrayInsert.push(toInsert);
			console.log('arrayInsert', arrayInsert);
		});

		detalleHandler = $.ajax({
			url: '_ajax_configuracion_contrato_dev.php?sp=insertdetalle',
			type: 'POST',
			data: {
				stringified: JSON.stringify(arrayInsert)
			}
		});

		//debugger;
		detalleHandler.done(function (response) {
			console.log('Detalle Insertado');
			oParams = { IN_ID: ID_CONT_MOD };
			console.log(oParams);
			$.ajax({
				url: '_ajax_configuracion_contrato_dev.php?sp=check_insertDetalle',
				type: 'POST',
				data: oParams,
				success: function (data) {
					jsonResponse = JSON.parse(data);
					console.log('data:' + jsonResponse.OUT_DOCUMENTO);
					console.log(
						'data2:' + (parseInt(jsonResponse.OUT_DOCUMENTO) > 0)
					);
					if (parseInt(jsonResponse.OUT_DOCUMENTO) > 0) {
						console.log('data: OK');
						error = 0;
					} else {
						$.ajax({
							url: '_ajax_configuracion_contrato_dev.php?sp=set_error_cabecera',
							type: 'POST',
							data: oParams
						});
						console.log('data: ERROR');
						error = 1;
					}
				}
			});
		});
	});
	return error;
}

function pad(str, max) {
	str = str.toString();
	return str.length < max ? pad('0' + str, max) : str;
}

function GoToAgenda() {
	window.location.href = 'agenda_inst.php';
}

function dbclickRet() {
	//obtengo meses
	let meses = document.querySelector('.newrow').children[1].innerHTML;

	// FECHA INICIO
	let dt = new Date();
	let year = dt.getFullYear();
	let month = dt.getMonth() + 1;
	let Inicio = formatDate(new Date(year, month, '01'));
	const dateInputInicio = document.getElementById('fechainicio');
	dateInputInicio.value = Inicio;

	// FECHA FIN
	dt = new Date();
	year = dt.getFullYear();
	month = dt.getMonth() + parseInt(meses);
	let Fin = formatDate(new Date(year, month, '00'));
	const dateInputFin = document.getElementById('fechafin');
	dateInputFin.value = Fin;

	$('#modalFechaRet').modal('show');
}

function hboDiscountDates() {
	// Obtengo meses
	let meses = parseInt(
		document.querySelector('.newrow').children[1].innerHTML
	);

	// FECHA INICIO
	let dtInicio = new Date();
	let yearInicio = dtInicio.getFullYear();
	let monthInicio = dtInicio.getMonth() + 1;
	let inicio = formatDate(new Date(yearInicio, monthInicio, 0));
	const dateInputInicio = document.getElementById('fechainicio');
	dateInputInicio.value = inicio;

	// FECHA FIN
	let dtFin = new Date();
	let yearFin = dtFin.getFullYear();
	let monthFin = dtFin.getMonth() + 1 + meses;
	let fin = formatDate(new Date(yearFin, monthFin, 0));
	const dateInputFin = document.getElementById('fechafin');
	dateInputFin.value = fin;
}

function add_months(dt, n) {
	return new Date(dt.setMonth(dt.getMonth() + n));
}

function padTo2Digits(num) {
	return num.toString().padStart(2, '0');
}

function formatDate(date) {
	return [
		date.getFullYear(),
		padTo2Digits(date.getMonth() + 1),
		padTo2Digits(date.getDate())
	].join('-');
}
