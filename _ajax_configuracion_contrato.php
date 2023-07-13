<?php

require_once('includes/boot.php');

cargar('sp', '');
cargar('cant', '');
cargar('rownum', '');

switch ($sp) {
    case 'cantidad':
        $oraDB->addProcedure("RECLAMOS", "SP_ADM_CONFIGURADOR_CANTIDAD");

        $oraDB->addParameter("IN_CODIGO", trim($_POST["id"]));

        $result = $oraDB->executeProcedure();

        if ($result[0]["TIPO"] == "CANTIDAD") {
            echo "1";
        } else {
            echo "0";
        }
        break;

    case 'precedencia':
        $oraDB->addProcedure("RECLAMOS", "SP_ADM_CONFIGURADOR_PRECE");

        $oraDB->addParameter("IN_CODIGO", trim($_POST["IN_CODIGO"]));
        $oraDB->addParameter("IN_LISTAPRECIO", trim($_POST["IN_LISTAPRECIO"]));
        $oraDB->addParameter("IN_SERVICIO", trim($_POST["IN_SERVICIO"]));

        $result = $oraDB->executeProcedure();

        foreach ($result as $col) {
            echo "<tr class='newrow' id='newrow'>";
            foreach ($col as $item) {
                echo "<td>" . ($item !== null ? $item : "") . "</td>";
            }
            echo "</tr>";
        }
        break;

    case 'obligacion':
        $oraDB->addProcedure("RECLAMOS", "SP_ADM_CONFIGURADOR_OBLIG");

        $oraDB->addParameter("IN_CODIGO", trim($_POST["IN_CODIGO"]));
        $oraDB->addParameter("IN_LISTAPRECIO", trim($_POST["IN_LISTAPRECIO"]));
        $oraDB->addParameter("IN_SERVICIO", trim($_POST["IN_SERVICIO"]));

        $result = $oraDB->executeProcedure();

        foreach ($result as $col) {
            echo "<tr class='newrow' id='newrow'>";
            $rownum++;
            echo "<td>" . $rownum . "</td>";
            $count = 0;
            foreach ($col as $key => $item) {
                $count++;
                if ($count <= 2) {
                    echo "<td>" . ($item !== null ? $item : "") . ($cant != 0 && $key == "DESCRIPCION" ? " (Cant. " . $cant . ")" : "") . "</td>";
                }
            }
            echo "<td>" . $_POST["IN_SERVICIO"] . "</td>";
            $oraDB->addProcedure("RECLAMOS", "SP_ADM_CONFIGURADOR_PRECIO");

            $oraDB->addParameter("IN_CODIGO", trim($col["CODIGO"]));
            $oraDB->addParameter("IN_LISTAPRECIO", trim($_POST["IN_LISTAPRECIO"]));

            $result = $oraDB->executeProcedure();
            echo "<td>$" . number_format((float)$result[0][PRECIO], 2, '.', '') . "</td>";
            echo "</tr>";
        }
        break;

    case 'precio':
        $oraDB->addProcedure("RECLAMOS", "SP_ADM_CONFIGURADOR_PRECIO");

        $oraDB->addParameter("IN_CODIGO", trim($_POST["IN_CODIGO"]));
        $oraDB->addParameter("IN_LISTAPRECIO", trim($_POST["IN_LISTAPRECIO"]));

        $result = $oraDB->executeProcedure();

        echo number_format((float)$result[0]["PRECIO"], 2, '.', '');
        break;

    case 'descuentos':
        $oraDB->addProcedure("RECLAMOS", "SP_ADM_CONFIGURADOR_DESCUENTO");

        $oraDB->addParameter("IN_CODIGOSERVICIO", trim($_POST["IN_CODIGOSERVICIO"]));
        $oraDB->addParameter("IN_SECTOR", trim($_POST["IN_SECTOR"]));

        $result = $oraDB->executeProcedure();
        if ($result[0] != null) {
            echo "<table class='table table-nomargin table-bordered table-hover dataTable-nofooter dataTable-nofooterhack clickeable'>";
            echo "<thead><tr>";
            foreach ($result[0] as $key => $value) {
                echo "<th>" . $key . "</th>";
            }
            echo "</tr></thead><tbody>";
            foreach ($result as $col) {
                echo "<tr>";
                $count = 0;
                foreach ($col as $key => $item) {
                    echo "<td>" . ($item !== null ? htmlentities($item, ENT_QUOTES) : "") . "</td>";
                }
                echo "</tr>";
            }
            echo "</tbody></table>";
        } else {
            echo "No hay descuentos disponibles para el ítem";
        }
        break;

    case 'insertcabecera':

        $oraDB->addProcedure("RECLAMOS", "SP_ADM_CONFIGURADOR_INSERTCABE");

        $oraDB->addParameterPWDP("IN_CLIENTE", $_POST["IN_CLIENTE"], "IN");
        $oraDB->addParameterPWDP("IN_USUARIO", $_POST["IN_USUARIO"], "IN");
        $oraDB->addParameterPWDP("IN_VENDEDOR", $_POST["IN_VENDEDOR"], "IN");
        $oraDB->addParameterPWDP("IN_DETALLE", $_POST["IN_DETALLE"], "IN");
        $oraDB->addParameterPWDP("IN_TIPOVENTA", $_POST["IN_TIPOVENTA"], "IN");
        $oraDB->addParameterPWDP("ID_MOD", NULL, "OUT");

        $return = $oraDB->executePWDP();

        echo json_encode($return);
        $oraDB->TrackAction($_SESSION["trackId"], "INFORMACION GENERAL", "CONFIGURACION CONTRATO");
        $_SESSION["trackCount"]++;
        break;

    case 'insertcabeceraalta':

        $oraDB->addProcedure("RECLAMOS", "SP_ADM_ALTACLIENTE_CONTRATO");

        $oraDB->addParameterPWDP("IN_SOLICITUD", $_POST["IN_SOLICITUD"], "IN");
        $oraDB->addParameterPWDP("IN_USUARIO", $_POST["IN_USUARIO"], "IN");
        $oraDB->addParameterPWDP("IN_VENDEDOR", $_POST["IN_VENDEDOR"], "IN");
        $oraDB->addParameterPWDP("IN_DETALLE", $_POST["IN_DETALLE"], "IN");
        $oraDB->addParameterPWDP("IN_TIPOVENTA", $_POST["IN_TIPOVENTA"], "IN");
        // $oraDB->addParameterPWDP("ID_MOD", NULL, "OUT");

        $return = $oraDB->executePWDP();

        echo json_encode($return);
        $oraDB->TrackAction($_SESSION["trackId"], "INFORMACION GENERAL", "CONFIGURACION CONTRATO");
        $_SESSION["trackCount"]++;
        break;

    case 'insertdetalle':
        $return = "";
        $jsonPost = json_decode($_POST["stringified"]);
        foreach ($jsonPost as $object) {
            //$oraDB->addProcedure("RECLAMOS", "SP_ADM_CONFIGURADOR_INSERTDET"); este se cambio por el 2 que agrega fecha de inicio y fin manuealmente
            $oraDB->addProcedure("RECLAMOS", "SP_ADM_CONFIGURADOR_INSERTDET2");
            foreach ($object as $key => $value) {
                $oraDB->addParameterPWDP($key, $value, "IN");
            }
            $return .= " " . $oraDB->executePWDP();
        }
        echo $return;

        break;

    case 'insertdetallealta':
        $return = "";
        $jsonPost = json_decode($_POST["stringified"]);
        echo "<script type='text/javascript'>alert($jsonPost);</script>";
        var_dump($jsonPost);
        foreach ($jsonPost as $object) {
            $oraDB->addProcedure("RECLAMOS", "SP_ADM_CONFIGURADOR_ACONTRATO");
            foreach ($object as $key => $value) {
                $oraDB->addParameterPWDP($key, $value, "IN");
            }
            $return .= " " . $oraDB->executePWDP();
        }
        echo $return;

        break;

    case 'check_insertDetalle':
        $jsonPost = str_pad(json_decode($_POST["IN_ID"]), 8, "0", STR_PAD_LEFT);
        $oraDB->addProcedure('RECLAMOS', 'CONTRATO_CHECK_DETALLE');
        $oraDB->addParameterPWDP("IN_ID", $jsonPost, "IN");
        $oraDB->addParameterPWDP("OUT_DOCUMENTO", NULL, "OUT");
        $result = $oraDB->executePWDP();
        echo json_encode($result);
        break;
    case 'set_error_cabecera':
        $jsonPost = str_pad(json_decode($_POST["IN_ID"]), 8, "0", STR_PAD_LEFT);
        $oraDB->addProcedure('RECLAMOS', 'CONTRATO_SET_ERROR_CABECERA');
        $oraDB->addParameterPWDP("IN_ID", $jsonPost, "IN");
        $result = $oraDB->executePWDP();
        echo json_encode($result);
        break;


    case 'getpendiente':
        $oraDB->addProcedure("RECLAMOS", "SP_ADM_CONFIGURADOR_PENDIENTE");

        $oraDB->addParameter("IN_CODIGO", trim($_POST["IN_CODIGO"]));

        $result = $oraDB->executeProcedure();

        echo $result[0]["DATOS_SOLICITUD"];
        break;

    case 'googleChange':
        $oraDB->addProcedure("RECLAMOS", "SP_GEO_MODIFICAR_COORDENADAS");

        $oraDB->addParameter("IN_CODIGO", $_GET["IN_CODIGO"]);
        $oraDB->addParameter("IN_LAT", $_GET["IN_LAT"]);
        $oraDB->addParameter("IN_LNG", $_GET["IN_LNG"]);

        $response = $oraDB->execStoredWO();

        echo $response;

        $oraDB->TrackAction($_SESSION["trackId"], "INFORMACION GENERAL", "CAMBIAR COORDENADAS");
        $_SESSION["trackCount"]++;

        break;

    case 'checkCortePlano':
        $oraDB->addProcedure("RECLAMOS", "SP_ADM_MENSAJE_CORTE");

        $oraDB->addParameter("IN_CODIGO", trim($_POST["IN_CODIGO"]));

        $result = $oraDB->executeProcedure();

        echo json_encode($result);
        break;

    case 'normaltoecon':
        $oraDB->addProcedure("RECLAMOS", "SP_ADM_SACAR_DIGITAL");

        $oraDB->addParameter("IN_CODIGO", trim($_POST["IN_CODIGO"]));

        $response = $oraDB->execStoredWO();

        echo $response;

        $oraDB->TrackAction($_SESSION["trackId"], "INFORMACION GENERAL", "LISTA PRECIO NORMAL A ECONOMICA");
        $_SESSION["trackCount"]++;

        break;

    case 'getHistorialPlano':
        $oraDB->addProcedure("RECLAMOS", "SP_ADM_HISTORIA_CORTE");

        $oraDB->addParameter("IN_CODIGO", trim($_POST["IN_CODIGO"]));

        $result = $oraDB->executeProcedure();

        echo "<table class='table table-nomargin table-bordered table-hover dataTable-nofooter dataTable-nofooterhack clickeable'>";
        echo "<thead><tr>";
        echo "<th>DIFERENCIA</th>";
        foreach ($result[0] as $key => $value) {
            echo "<th>" . $key . "</th>";
        }
        echo "</tr></thead><tbody>";
        foreach ($result as $col) {
            echo "<tr>";

            $fechainicio = $col['FECHA_INICIO'];
            $fechainicio = date("d/m/Y H:i:s", strtotime($fechainicio));
            $iHora = explode(":", $fechainicio);
            $iHora[0] = trim(substr($iHora[0], -2));
            $iDia = explode("/", $fechainicio);
            $iDia[2] = trim(substr($iDia[2], 0, 4));

            $fechainicio = date("c", mktime($iHora[0], $iHora[1], $iHora[2], $iDia[1], $iDia[0], $iDia[2]));
            $fechainicio = new DateTime($fechainicio);

            $fechafin = $col['FECHA_FIN'];
            $iHora = explode(":", $fechafin);
            $iHora[0] = trim(substr($iHora[0], -2));
            $iDia = explode("/", $fechafin);
            $iDia[2] = trim(substr($iDia[2], 0, 4));

            $fechafin = date("c", mktime($iHora[0], $iHora[1], $iHora[2], $iDia[1], $iDia[0], $iDia[2]));
            $fechafin = new DateTime($fechafin);

            $diferencia = $fechafin->diff($fechainicio);
            if ($diferencia->format("%d") > 1 || $diferencia->format("%d") == 0) {
                $strDia = "dias";
            } elseif ($diferencia->format("%d") == 1) {
                $strDia = "dia";
            }
            if ($diferencia->format("%h") > 1 || $diferencia->format("%h") == 0) {
                $strHora = "horas";
            } elseif ($diferencia->format("%h") == 1) {
                $strHora = "hora";
            }
            if ($diferencia->format("%i") > 1 || $diferencia->format("%i") == 0) {
                $strMinuto = "minutos";
            } elseif ($diferencia->format("%i") == 1) {
                $strMinuto = "minuto";
            }
            echo "<td>" . $diferencia->format("%d " . $strDia . " %h " . $strHora . " %i " . $strMinuto) . "</td>";
            $count = 0;
            // foreach ($col as $key => $item) {
            //     echo "<td>" . ($item !== null ? htmlentities($item, ENT_QUOTES) : "") . "</td>";
            // }
            $fechainicio = $col['FECHA_INICIO'];
            $fechainicio = date("d/m/Y H:i:s", strtotime($fechainicio));
            $fechafin = $col['FECHA_FIN'];
            echo "<td>" . $fechainicio . "</td>";
            echo "<td>" . $fechafin . "</td>";
            echo "<td>" . $col["MOTIVO"] . "</td>";
            echo "<td>" . $col["OT_OBRA"] . "</td>";
            echo "</tr>";
        }
        echo "</tbody></table>";
        break;

    case 'getzonas':

        $response = $oraDB->executeQuery("SELECT ID, NOMBRE DESCRIPCION FROM ITEMTIPOCLASIFICADOR WHERE ACTIVESTATUS=0 AND BO_PLACE_ID = '{BB739E19-566B-4E4E-A5E8-207137BA3FF8}' AND NOMBRE IN (SELECT DES_ZONA FROM RECLAMOS.AGRUPADOR_IMPRESION WHERE COD_SUCURSAL= (SELECT COD_SUCURSAL FROM RECLAMOS.LOCALIDAD_SUCURSAL WHERE ID_LOCALIDAD = '" . $_GET['SUCURSAL'] . "')) ORDER BY 2");

        echo json_encode($response);

        break;

    default:
        echo "No se encontro el store indicado";
        break;
}
