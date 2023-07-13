CREATE OR REPLACE PROCEDURE RECLAMOS.SP_ADM_CONFIGURADOR_INSERTDET2
(IN_IDALTA              IN VARCHAR2,
IN_CODIGOSERVICIO       IN VARCHAR2,
IN_RUBRO                IN VARCHAR2,
IN_ORDEN                IN VARCHAR2,
IN_DESCRIPCION          IN VARCHAR2,
IN_ITEM_CONTRATO_ANT IN VARCHAR2,
 IN_INIFECHARET             IN VARCHAR2,
 IN_FINFECHARET             IN VARCHAR2) 
IS
v_paquete    INT;
v_ORDEN      INT;
v_itemadescontar     INT;
v_descuento  INT;

CURSOR xPAQUETESITEM IS (SELECT * FROM  RECLAMOS.PAQUETES_NEXO_ITEMS WHERE CODIGO = IN_CODIGOSERVICIO);   
BEGIN  
     v_paquete := 0;
     v_ORDEN := IN_ORDEN;
     v_itemadescontar:=0;
     v_descuento :=0; --esto es para ver si trae un descuento de un servicio que no este en item_contrato_ant
    
    SELECT COUNT(*) INTO v_paquete FROM RECLAMOS.PAQUETES_NEXO WHERE CODIGO = IN_CODIGOSERVICIO AND CONFIGURADOR='T';
   
    SELECT COUNT(*) INTO v_ORDEN FROM RECLAMOS.ITEMS_CONTRATO_ANT WHERE ID_ALTACLIENTEPOTENCIAL = IN_IDALTA;
    
    IF V_ORDEN = 0 THEN
        V_ORDEN:=IN_ORDEN;
    ELSE
       SELECT ORDEN + 1 INTO v_ORDEN FROM (SELECT ORDEN FROM RECLAMOS.ITEMS_CONTRATO_ANT WHERE ID_ALTACLIENTEPOTENCIAL = IN_IDALTA ORDER BY TO_NUMBER(ORDEN) DESC) WHERE ROWNUM <2;
    END IF;
    
   
    
    IF v_paquete > 0 THEN
    
             FOR x IN xPAQUETESITEM LOOP  
                       
                         --INSERT INTO RECLAMOS.ITEMS_CONTRATO (ID_ALTACLIENTEPOTENCIAL, SERVICIO, RUBRO, ORDEN, DESCRIPCION,ID_DESCUENTO)
                           INSERT INTO RECLAMOS.ITEMS_CONTRATO_ANT (ID_ALTACLIENTEPOTENCIAL, SERVICIO, RUBRO, ORDEN, DESCRIPCION,ID_ITEM_CONTRATO_ANT,ID_DESCUENTO,FECHAINICIO,FECHAFIN,MONTO,DURACION,PORCENTAJE)
                          VALUES
                          (IN_IDALTA, TRIM(x.CODIGO_CALIPSO)  ,'TVCABLE',v_ORDEN ,x.COMPLEMENTO,IN_ITEM_CONTRATO_ANT,x.ID_DESCUENTO,TO_CHAR(ADD_MONTHS(SYSDATE,x.MESES),'yyyymmdd'),TO_CHAR(ADD_MONTHS(SYSDATE,(x.MESES + x.DURACION)),'yyyymmdd'),x.MONTO,x.DURACION,x.PORCENTAJE );
                          --(IN_IDALTA, x.CODIGO_CALIPSO  ,'TVCABLE',x.ORDEN ,x.COMPLEMENTO,x.ID_DESCUENTO);
                          
                            IF x.CODIGO_CALIPSO ='03000171' THEN 
                               v_itemadescontar :=v_ORDEN;
                               v_ORDEN:= v_ORDEN + 1;
                               INSERT INTO RECLAMOS.ITEMS_CONTRATO_ANT (ID_ALTACLIENTEPOTENCIAL, SERVICIO, RUBRO, ORDEN, DESCRIPCION,ID_ITEM_CONTRATO_ANT,ID_DESCUENTO,FECHAINICIO,FECHAFIN,MONTO,DURACION,PORCENTAJE)
                              VALUES
                              (IN_IDALTA, '03000115'  ,'TVCABLE',v_ORDEN ,'DESCUENTOS (Item: '||TRIM(TO_CHAR(v_itemadescontar,'00'))||', Dur.: 13 meses, Porc.: 00100%, Monto: 00000, Servicio: 03000171 - PACK HD)',IN_ITEM_CONTRATO_ANT,'{81FE4B90-DEDF-480D-81B3-F0897F16A7A8}',TO_CHAR(ADD_MONTHS(SYSDATE,0),'yyyymmdd'),TO_CHAR(ADD_MONTHS(TRUNC(SYSDATE,'MM')-1,(0 + 13)),'yyyymmdd'),'0','13','100' );
                                        
                              
                         END IF;        
                          
                          IF x.CODIGO_CALIPSO ='03000170' THEN 
                               v_itemadescontar :=v_ORDEN;
                               v_ORDEN:= v_ORDEN + 1;
                               INSERT INTO RECLAMOS.ITEMS_CONTRATO_ANT (ID_ALTACLIENTEPOTENCIAL, SERVICIO, RUBRO, ORDEN, DESCRIPCION,ID_ITEM_CONTRATO_ANT,ID_DESCUENTO,FECHAINICIO,FECHAFIN,MONTO,DURACION,PORCENTAJE)
                              VALUES
                              (IN_IDALTA, '03000115'  ,'TVCABLE',v_ORDEN ,'DESCUENTOS (Item: '||TRIM(TO_CHAR(v_itemadescontar,'00'))||', Dur.: 03 meses, Porc.: 00100%, Monto: 00000, Servicio: 03000170 - FOX HD)',IN_ITEM_CONTRATO_ANT,'{36138B05-839F-4DAE-8E0E-F27FDA44CC62}',TO_CHAR(ADD_MONTHS(SYSDATE,0),'yyyymmdd'),TO_CHAR(ADD_MONTHS(TRUNC(SYSDATE,'MM')-1,(0 + 3)),'yyyymmdd'),'0','3','100' );
                                v_ORDEN:= v_ORDEN + 1;                           
                               INSERT INTO RECLAMOS.ITEMS_CONTRATO_ANT (ID_ALTACLIENTEPOTENCIAL, SERVICIO, RUBRO, ORDEN, DESCRIPCION,ID_ITEM_CONTRATO_ANT,ID_DESCUENTO,FECHAINICIO,FECHAFIN,MONTO,DURACION,PORCENTAJE)                                                         
                              VALUES
                              (IN_IDALTA, '03000115'  ,'TVCABLE',v_ORDEN ,'DESCUENTOS (Item: '||TRIM(TO_CHAR(v_itemadescontar,'00'))||', Dur.: 03 meses, Porc.: 00050%, Monto: 00000, Servicio: 03000170 - FOX HD)',IN_ITEM_CONTRATO_ANT,'{85C2F3A9-9753-40AF-910C-C283ECF739AC}',TO_CHAR(ADD_MONTHS(TRUNC(SYSDATE,'MM'),3),'yyyymmdd'),TO_CHAR(ADD_MONTHS(TRUNC(SYSDATE,'MM')-1,(2 + 3)),'yyyymmdd'),'0','3','50' );
                         END IF;      
                         
                          IF x.CODIGO_CALIPSO ='03000241' THEN 
                               v_itemadescontar :=v_ORDEN;
                               v_ORDEN:= v_ORDEN + 1;
                               INSERT INTO RECLAMOS.ITEMS_CONTRATO_ANT (ID_ALTACLIENTEPOTENCIAL, SERVICIO, RUBRO, ORDEN, DESCRIPCION,ID_ITEM_CONTRATO_ANT,ID_DESCUENTO,FECHAINICIO,FECHAFIN,MONTO,DURACION,PORCENTAJE)
                              VALUES
                              (IN_IDALTA, '03000115'  ,'TVCABLE',v_ORDEN ,'DESCUENTOS (Item: '||TRIM(TO_CHAR(v_itemadescontar,'00'))||', Dur.: 03 meses, Porc.: 00100%, Monto: 00000, Servicio: 03000241 - PACK FÚTBOL)',IN_ITEM_CONTRATO_ANT,'{4F3A06C8-FB1E-4FA7-9ECD-19638A5DE47F}',TO_CHAR(ADD_MONTHS(SYSDATE,0),'yyyymmdd'),TO_CHAR(ADD_MONTHS(TRUNC(SYSDATE,'MM')-1,(0 + 3)),'yyyymmdd'),'0','3','100' );
                            
                         END IF;        
                         
                          IF x.CODIGO_CALIPSO ='03000310' THEN 
                               v_itemadescontar :=v_ORDEN;
                               v_ORDEN:= v_ORDEN + 1;
                               INSERT INTO RECLAMOS.ITEMS_CONTRATO_ANT (ID_ALTACLIENTEPOTENCIAL, SERVICIO, RUBRO, ORDEN, DESCRIPCION,ID_ITEM_CONTRATO_ANT,ID_DESCUENTO,FECHAINICIO,FECHAFIN,MONTO,DURACION,PORCENTAJE)
                              VALUES
                              (IN_IDALTA, '03000115'  ,'TVCABLE',v_ORDEN ,'DESCUENTOS (Item: '||TRIM(TO_CHAR(v_itemadescontar,'00'))||', Dur.: 13 meses, Porc.: 00100%, Monto: 00000, Servicio: 03000310 - TRIMI)',IN_ITEM_CONTRATO_ANT,'{FCE00D5C-D354-4D15-8993-784526C49099}',TO_CHAR(ADD_MONTHS(SYSDATE,0),'yyyymmdd'),TO_CHAR(ADD_MONTHS(TRUNC(SYSDATE,'MM')-1,(0 + 13)),'yyyymmdd'),'0','13','100' );
                            
                         END IF;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                            
                          IF x.CODIGO_CALIPSO ='03000145' THEN 
                               v_itemadescontar :=v_ORDEN;
                               v_ORDEN:= v_ORDEN + 1;
                               INSERT INTO RECLAMOS.ITEMS_CONTRATO_ANT (ID_ALTACLIENTEPOTENCIAL, SERVICIO, RUBRO, ORDEN, DESCRIPCION,ID_ITEM_CONTRATO_ANT,ID_DESCUENTO,FECHAINICIO,FECHAFIN,MONTO,DURACION,PORCENTAJE)
                              VALUES
                              (IN_IDALTA, '03000115'  ,'TVCABLE',v_ORDEN ,'DESCUENTOS (Item: '||TRIM(TO_CHAR(v_itemadescontar,'00'))||', Dur.: 03 meses, Porc.: 00100%, Monto: 00000, Servicio: 03000145 - HBO HD)',IN_ITEM_CONTRATO_ANT,'{E0A0C9E8-0131-4552-B932-4BB111F24C82}',TO_CHAR(ADD_MONTHS(SYSDATE,0),'yyyymmdd'),TO_CHAR(ADD_MONTHS(TRUNC(SYSDATE,'MM')-1,(0 + 3)),'yyyymmdd'),'0','3','100' );
                             v_ORDEN:= v_ORDEN + 1;
                               INSERT INTO RECLAMOS.ITEMS_CONTRATO_ANT (ID_ALTACLIENTEPOTENCIAL, SERVICIO, RUBRO, ORDEN, DESCRIPCION,ID_ITEM_CONTRATO_ANT,ID_DESCUENTO,FECHAINICIO,FECHAFIN,MONTO,DURACION,PORCENTAJE)
                              VALUES
                              (IN_IDALTA, '03000115'  ,'TVCABLE',v_ORDEN ,'DESCUENTOS (Item: '||TRIM(TO_CHAR(v_itemadescontar,'00'))||', Dur.: 03 meses, Porc.: 00050%, Monto: 00000, Servicio: 03000145 - HBO HD)',IN_ITEM_CONTRATO_ANT,'{5C437A9C-98FD-4770-BA37-BA166C946906}',TO_CHAR(ADD_MONTHS(TRUNC(SYSDATE,'MM'),3),'yyyymmdd'),TO_CHAR(ADD_MONTHS(TRUNC(SYSDATE,'MM')-1,(2 + 3)),'yyyymmdd'),'0','3','50' );
                         END IF;    
                            v_ORDEN:= v_ORDEN + 1;
                          COMMIT;
                          
                          
             END LOOP; 

    ELSE    
    
            SELECT COUNT(ORDEN) INTO v_descuento FROM RECLAMOS.ITEMS_CONTRATO_ANT WHERE SERVICIO =TRIM(SUBSTR(IN_DESCRIPCION,79,9)) AND ID_ALTACLIENTEPOTENCIAL = IN_IDALTA;
        
             IF IN_CODIGOSERVICIO = '03000115' AND v_descuento > 0 THEN
                    INSERT INTO RECLAMOS.ITEMS_CONTRATO_ANT (ID_ALTACLIENTEPOTENCIAL, SERVICIO, RUBRO, ORDEN, DESCRIPCION, ID_ITEM_CONTRATO_ANT,FECHAINICIO,FECHAFIN,PORCENTAJE)
                    VALUES
                    (IN_IDALTA, IN_CODIGOSERVICIO,IN_RUBRO,TO_CHAR(v_ORDEN), 'DESCUENTOS (Item: '||(SELECT DECODE(TRIM(TO_CHAR(ORDEN,'00')),NULL,SUBSTR(IN_DESCRIPCION,19,2),TRIM(TO_CHAR(ORDEN,'00'))) FROM RECLAMOS.ITEMS_CONTRATO_ANT WHERE SERVICIO =TRIM(SUBSTR(IN_DESCRIPCION,79,9)) AND ID_ALTACLIENTEPOTENCIAL = IN_IDALTA)||SUBSTR(IN_DESCRIPCION,21,130),IN_ITEM_CONTRATO_ANT,REPLACE(IN_INIFECHARET,'-',''),REPLACE(IN_FINFECHARET,'-',''),SUBSTR(IN_DESCRIPCION,46,5));
             ELSE
                  INSERT INTO RECLAMOS.ITEMS_CONTRATO_ANT (ID_ALTACLIENTEPOTENCIAL, SERVICIO, RUBRO, ORDEN, DESCRIPCION, ID_ITEM_CONTRATO_ANT, FECHAINICIO,FECHAFIN,PORCENTAJE)
                    VALUES
                    (IN_IDALTA, IN_CODIGOSERVICIO,IN_RUBRO,TO_CHAR(v_ORDEN),IN_DESCRIPCION,IN_ITEM_CONTRATO_ANT,REPLACE(IN_INIFECHARET,'-',''),REPLACE(IN_FINFECHARET,'-',''),SUBSTR(IN_DESCRIPCION,46,5));
             END IF;
            COMMIT;
    END IF;
       
END;
/
