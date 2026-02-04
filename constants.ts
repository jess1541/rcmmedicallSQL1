import { Doctor, ScheduleSlot } from './types';

// The raw data string provided by the user (Doctors)
const RAW_DATA = `
ORALIA	JOSE GUSTAVO MARTINEZ LUGO	GINECOLOGÍA Y OBSTETRICIA	CALZ DE GUADALUPE
ORALIA	 Denys Elizabeth Delgado Amador	Ginecologia y Obstetricia	Rio Bamaba 639. Lindavista
ORALIA	 Francisco Javier Guerrero Carreño	Ginecología y Obstetricia	Rio Bamaba 639. Lindavista
ORALIA	 Javier Hernandez Torres	Gineco-obstetricia	Rio Bamaba 639. Lindavista
ANGEL	ADIA CARRILLO PACHECO	GINECO OBSTETRICIA	TLACOTALPAN 59 ROMA SUR
ORALIA	Adrian Garcia Alvarez	Ginecologia	Avenida prados de cedro S/N Medical Towel
LUIS	Adrian Gonzalez Zuria	Ginecología y Obstetricia	San Angel Inn Acora
ORALIA	Adriana Esquivel Cervantes	Ginecologia	Sor Juan Ines de la Cruz 280, Tlalnepantla
LUIS	Adriana Galvan Luna	Ginecología y Obstetricia	San Angel Inn Acora
LUIS	Adriana Lopez Franco	Ginecología y Obstetricia	HMG
LUIS	Adriana Mercedes Acuña Euan	Ginecología y Obstetricia	Ángeles Universidad
ORALIA	Aida Simbron	Gineco _Obstetricia	Homero 1425, Polanco
ORALIA	Aide Yukieskany Gonzalez Vega	Ginecologia	Circuito Misioneros 5, Ciudad Satelite
TALINA	Alan de Jesús Martínez Salas	Urología/ LUIS	Hosp. Ángeles del Pedregal
ORALIA	Alba Jasso Gerardo Andrés	Ginecología y Obstetricia	Rio Bmaba 639. Lindavista
ORALIA	Alba Myriam García Rodríguez	Biología de Reproducción N. M. / Ginecología y Obstetricia	Temístocles 210, Polanco IV Secc, CDMX
ANGEL	ALBA NURI ZUÑIGA RODRIGUEZ	GINECO OBSTETRICIA	TORRE DURANGO 64
ANGEL	ALBERTO EDUARDO JACOBO BASTO	GINECO OBSTETRICIA	TORRE DURANGO 49
ANGEL	ALBERTO TREJO FAUSTO	UROLOGÍA / VISITARLO OPERA MUCHOCON NOSOTROS	TUXPAN 9 , piso 6, cons 612, roma sur
ANGEL	ALBERTO VIELMA VALDES	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
TALINA	Aldo Isaac Meneses Ríos	Biología de Reproducción, Ginecología y Obstetricia, Reproducción Asistida	Hospital Ángeles Acoxpa
LUIS	Alejandra Bravo Figueroa	Ginecologia y Obstetricia	MAC La Viga
LUIS	Alejandra García	Ginecología y Obstetricia	San Ángel Inn Universidad
LUIS	Alejandra Gomez Martinez	Ginecologia y Obstetricia	MAC La Viga
LUIS	Alejandra Lopez Chavez	Ginecología y Obstetricia	HMG
TALINA	Alejandra Marcela Santiago Aguirre	Ginecología y Obstetricia	HOSPITAL ANGELES PEDREGAL (Nueva Torre Clínica Piso 9 Consultorio 990)
ANGEL	ALEJANDRA MARTINEZ GOLDARACENA	GINECO OBSTETRICIA	FRONTERA 74 ROMA NORTE
TALINA	Alejandra Martínez Schulte	Ginecología y Obstetricia	Hospital Ángeles Pedregal, Torre Ángeles, piso 8, consultorio 825
ORALIA	Alejandra Ortega Gutiérrez	Ginecología y Obstetricia	Rio Bmaba 639. Lindavista
LUIS	Alejandra Robledo Torres	Ginecología y Obstetricia	Ángeles Universidad
LUIS	Alejandra Vega León	Ginecología y Obstetricia	San Ángel Inn Universidad
TALINA	ALEJANDRO  ORTIZ DE LA PEÑA Y CARRANZA	GINECOLOGÍA Y OBSTETRICIA	CAMINO A SANTA TERESA
TALINA	Alejandro Alias Melgar	Urología 	Hosp. Ángeles del Pedregal
TALINA	Alejandro Cumming Martínez Báez	Urología	Hosp. Ángeles del Pedregal
ANGEL	ALEJANDRO ESCOBEDO DIAZ	GINECO OBSTETRICIA	TORRE DURANGO 290
ORALIA	Alejandro Labastida	Gineco _Obstetricia	Alexander Von Humboldt 88, Lomas Verdes 3ra Secc, 53120 Naucalpan de Juárez, Méx
ORALIA	Alejandro Lopez Monter	Ginecologia	Av. montevideo 303, Lindavista
LUIS	ALEJANDRO NOYOLA GUADARRAMA	UROLOGÍA	AV DIVISION DEL NORTE
LUIS	Alejandro Rendon Molina	Ginecología y Obstetricia	Ángeles Universidad
TALINA	Alejandro Sierra Torres	Urología / TRABAJA CON NOSOTROS	Hosp. Ángeles del Pedregal
LUIS	Alfonso Armesto Santos	Ginecología y Obstetricia	San Ángel Inn Universidad
TALINA	Alfonso Armesto Santos	Ginecología y Obstetricia	Hosp. Ángeles del Pedregal
TALINA	Alfonso de Jesús Valle Escalante	Ginecología y Obstetricia	Hosp. Ángeles del Pedregal
ANGEL	ALFONSO MURILLO URIBE	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
ORALIA	Alfonso Sustaita Ballinas	Ginecologia	Sor Juan Ines de la Cruz 280, Tlalnepantla
LUIS	Alfredo González Cortés	Ginecología y Obstetricia	San Angel Inn Acora
ORALIA	Alfredo Saad Ganem	Ginecologia	Ejercito Nacional 613, Polanco
ANGEL	ALICIA GUZMAN GUZMAN	GINECO OBSTETRICIA	GOBERNADOR GREGORIO V. 29 MIGUEL HIDALGO
ORALIA	Aline Alejandra Bermudez	Ginecologia	Av. Dr. Gustavo Baz 309-TR A1
ANGEL	ALMA DELIA AVILA ARREAGA	GINECO OBSTETRICIA	QUERETARO 156, ROMA NORTE
TALINA	Alma Edith García Franco	Ginecología y Obstetricia	Hospital Ángeles Acoxpa
ANGEL	ALMA ESTHER NAVARRO SANCHEZ	GINECO OBSTETRICIA	TLACOTALPAN 59 ROMA SUR
ORALIA	Alma Itzel Cruz Picazo	Ginecologia	Sor Juan Ines de la Cruz 280, Tlalnepantla
ORALIA	Alondra Acala ochoa	Gineco _Obstetricia	Alexander Von Humboldt 88, Lomas Verdes 3ra Secc, 53120 Naucalpan de Juárez, Méx
LUIS	Álvaro Eduardo Peña Jiménez	Ginecología y Obstetricia	San Ángel Inn Universidad
ORALIA	Ana Carina Vazquez Martinez	Ginecologia	Av. montevideo 303, Lindavista
ANGEL	ANA CEDILLO SOTELO RUBIO	GINECO OBSTETRICIA	TORRE TUXPAN 6
ORALIA	Ana Cristina Arteaga Gómez	Ginecología Oncológica / Ginecología y Obstetricia	Temístocles 210, Polanco IV Secc, CDMX
ORALIA	Ana Cristina Salazar Melchor	Ginecología y Obstetricia	TEMISTOCLES 210, Polanco Iv Sección
LUIS	Ana Gabriela Carrillo Rodriguez	Ginecología y Obstetricia	Consultorio privado
TALINA	Ana Karen Gutiérrez Aguilar	Ginecología y Obstetricia	Hosp. Ángeles del Pedregal
ORALIA	Ana Karen Luna Resendiz	Ginecologia	Ejercito Nacional 613, Polanco
ANGEL	ANA LAURA BELLO MADRID	GINECO OBSTETRICIA	TORRE DURANGO 290
ANGEL	ANA MARIA RODRIGUEZ ROJAS	GINECO OBSTETRICIA	TLACOTALPAN 59 ROMA SUR
ANGEL	ANA MARIA VELASCO GUZMAN	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
TALINA	Ana Mireya Nuñez García	Ginecología y Obstetricia	Hospital MAC Cuemanco
TALINA	Ana Paola Sánchez Serrano	Ginecología / Reproducción	Hosp. Ángeles del Pedregal
LUIS	Ana Victoria Flores Hernandez	Ginecología y Obstetricia	San Angel Inn Acora
TALINA	Ana Yemci Franco Uribe	Ginecología y Obstetricia	Hospital Ángeles Acoxpa
LUIS	Andrea Paulina Salinas Quiroz	Ginecologia y Obstetricia	MAC La Viga
ANGEL	ANDREAS MADARIAGA	GINECO OBSTETRICIA	TORRE TUXPAN 16
ORALIA	Andres Alejandro Rosero Flores	Ginecologia	Sor Juan Ines de la Cruz 280, Tlalnepantla
ORALIA	Andres Flores	Ginecologia	Av. Lomas verdes 2165, Naucalpan
TALINA	Andrés Gudiño Chávez	Urología	Hosp. Ángeles del Pedregal
ORALIA	Andres Ivan Morales Cervantes	Ginecologia	Sor Juan Ines de la Cruz 280, Tlalnepantla
TALINA	Andrés Martínez Cornelio	Urología / ESTA EN ABC OBSERVATORIO	Hospital Ángeles Acoxpa
ORALIA	Andrés Vicente Vela Vizuet	Ginecología y Obstetricia - Andrología	Rio Bmaba 639. Lindavista
TALINA	Andrey Ramírez Ramírez	Urología	Hospital Ángeles Acoxpa
ORALIA	Angel Allan Díaz Quevedo	Ginecologia	Sor Juan Ines de la Cruz 280, Tlalnepantla
ANGEL	ANGEL ANTONIO LICONA VAZQUEZ	GINECO OBSTETRICIA	FRONTERA 74 ROMA NORTE
TALINA	Angel Antonio Licona Vázquez	Ginecología y Obstetricia, Uroginecología, Laparoscopía	Hospital Ángeles Acoxpa
LUIS	Angel Elizalde Mendez	Ginecología y Obstetricia	Ángeles Universidad
TALINA	ANGEL LEMUS HUERTA	GINECOLOGÍA Y OBSTETRICIA	CAMINO A SANTA TERESA
ORALIA	Angel Millan Juarez	Ginecologia	Av. Lomas verdes 2165, Naucalpan
ANGEL	ANGELES JUAREZ	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
ORALIA	Angelica Figueras Lopez	Ginecologia	Av. montevideo 303, Lindavista
ANGEL	ANTONIO ALCAZAR ALARCON	GINECO OBSTETRICIA	TEHUANTEPEC 251
ORALIA	Antonio CarvajalGomez	Ginecologia	Av. Lomas verdes 2165, Naucalpan
ANGEL	ANTONIO GUZMAN A	GINECO OBSTETRICIA	TEPIC 139
LUIS	Araceli Montaño Román	Ginecología y Obstetricia	HMG
ANGEL	ARACELY MATIAS OLVERA	GINECO OBSTETRICIA	TLACOTALPAN 59 ROMA SUR
ANGEL	ARCADIO MORALES		EJE 3 SUR 218 ROMA SUR
TALINA	Arely Peña García	Ginecología y Obstetricia	Hosp. Ángeles del Pedregal
LUIS	Ariadna Elizabeth Ortega Diaz		San Ángel Inn Universidad
ORALIA	Ariadna Sanchez Mendoza	Ginecologia	Sor Juan Ines de la Cruz 280, Tlalnepantla
ORALIA	Armado Ayala Macín	Ginecologia	Paseo Alexander Von Humbold 88
LUIS	Armando Avilez Bacre	Ginecología y Obstetricia	Ángeles Universidad
ANGEL	ARMANDO RAMIREZ CARRASCO	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
ANGEL	ARMANDO RUIZ VALDEZ	GINECO OBSTETRICIA	TUXPAN 39
LUIS	Arnulfo Cañas Trujillo	Ginecología y Obstetricia	HMG
ORALIA	ARTURO JORGE ESPARZA	GINECOLOGÍA Y OBSTETRICIA	AV LOMAS VERDES
TALINA	ARTURO MENDOZA VALDES	UROLOGÍA	PUENTE DE PIEDRA
ORALIA	ASAEL FLORES GARCIA	GINECOLOGÍA Y OBSTETRICIA	MONTIEL
LUIS	Auria Avendaño Perez	Ginecología y Obstetricia	San Angel Inn Acora
ORALIA	Aurora Gomez Romero	Ginecologia	Av. Lomas verdes 2165, Naucalpan
ORALIA	Baños Hernández Karina Lizbeth	Ginecología	Rio Bmaba 639. Lindavista
ANGEL	BEATRIZ MONROY CASTILLO	GINECO OBSTETRICIA	TEPIC 139
ORALIA	Bedia Sánchez Luis Miguel	Ginecología y Obstetricia - Biología de la Reproducción	Rio Bmaba 639. Lindavista
ORALIA	Belem Carolina de Alba Gonzalez	Ginecologia	Av. Lomas verdes 2165, Naucalpan
LUIS	Benjamin Orozco Zuñiga	Ginecología y Obstetricia	Ángeles Universidad
LUIS	Berenice Cirigo Hernández	Ginecología y Obstetricia	San Ángel Inn Universidad
LUIS	Berenice Flores Maldonado	Ginecología y Obstetricia	Ángeles Universidad
ORALIA	Bernardett Orizaba Chávez 	Ginecología y Obstetricia	Rio Bmaba 639. Lindavista
ANGEL	BERNARDO FERNANDEZ SALAZAR	GINECO OBSTETRICIA	TORRE DURANGO 49
ANGEL	BERTHA CECILIA DE AVILA	GINECO OBSTETRICIA	TORRE TUXPAN 16
ORALIA	Bertha Piña Angeles	Ginecologia	Enrique Sada Muguerza 17
LUIS	Bibiana Aldanoli Arredondo Rodriguez	Ginecología y Obstetricia	San Ángel Inn Universidad
ORALIA	Blanca Rodriguez Grijalva	Ginecologia	Ejercito Nacional 613, Polanco
TALINA	Braulio Gerardo Quesada Reyna	Ginecología y Obstetricia	Hospital Ángeles Acoxpa
ORALIA	Brenda Sánchez Ramírez	Biología de Reproducción N. M. / Ginecología y Obstetricia	Temístocles 210, Polanco IV Secc, CDMX
ORALIA	Campos Reyes Brenda	Ginecología y obstetricia	Rio Bmaba 639. Lindavista
ANGEL	CARLA AMERICA SUAREZ JUAREZ	GINECO OBSTETRICIA	TLACOTALPAN 59 ROMA SUR
TALINA	Carlos Alberto González Espinosa	Urología	Hospital Ángeles Acoxpa
ANGEL	CARLOS ALBERTO SERVIN HERNANDEZ	GINECOLOGÍA ONCOLÓGICA	TEHUANTEPEC
LUIS	Carlos Andres Sanchez Arreola	Ginecologia y Obstetricia	MAC La Viga
TALINA	Carlos Antonio Godínez Nava	Urología	Hosp. Ángeles del Pedregal
ANGEL	CARLOS BENJAMIN CASTAÑEDA VALDIVIA	GINECO OBSTETRICIA	QUERETARO 58 ROMA NORTE
ANGEL	CARLOS ENRIQUE GALICIA GARCIA	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
LUIS	Carlos Enrique Perez Serna	Ginecologia y Obstetricia	MAC La Viga
ANGEL	CARLOS ENRIQUE SOTO ABURTO	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
LUIS	Carlos José Molina Pérez	Ginecología y Obstetricia	IMSS 4
TALINA	Carlos Martínez Arroyo	Urología	Hospital Ángeles Acoxpa
ANGEL	CARLOS SANCHEZ MORENO	UROLOGÍA / NO VISITARLO	COLIMA
ORALIA	Carlos Zapico Orrtiz	Ginecologia	Circuito Misioneros 5, Ciudad Satelite
LUIS	Carmen Lizeth Olmos Mejia	Ginecología y Obstetricia	San Angel Inn Acora
ORALIA	Carmen Rosa Mejía Villarroel	Ginecología y Obstetricia	Rio Bmaba 639. Lindavista
ANGEL	CAROLINA CASTILLO GIACOMAN	GINECO OBSTETRICIA	TORRE DURANGO 33
ANGEL	CAROLINA CONTRERAS	GINECO OBSTETRICIA	TEPIC 113
ANGEL	CAROLINA CONTRERAS	GINECO OBSTETRICIA	TORRE TEPIC 113
ANGEL	CAROLINA GERMENDIA GALLARDO	GINECO OBSTETRICIA	TUXPAN 54
ANGEL	CAROLINA NAVARRO VENEGAS	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
ORALIA	Castañeda Arreola Gerardo	Ginecologia	Rio Bmaba 639. Lindavista
LUIS	Catalina Barrón Alvarez	Ginecología y Obstetricia	San Angel Inn Acora
LUIS	Cecilia Camacho Rios	Ginecología y Obstetricia	San Angel Inn Acora
ANGEL	CECILIO RODRIGUEZ AYALA	GINECO OBSTETRICIA	TORRE DURANGO 290
ANGEL	CESAR ABIMAEL C ALCAZAR	GINECO OBSTETRICIA	TUXPAN 54
ANGEL	CESAR JAIR LOPEZ DE LA ROSA	GINECO OBSTETRICIA	QUERETARO 156, ROMA NORTE
LUIS	César Rodríguez	Ginecología y Obstetricia	San Ángel Inn Universidad
ORALIA	Cesar Santiago	Ginecologia	Av. Lomas verdes 2165, Naucalpan
ANGEL	CESAR YAIR LOPEZ DE LA ROSA	GINECOLOGÍA Y OBSTETRICIA	QUERETARO
ANGEL	CHRISTIAN ACEVEDO GARCIA	UROLOGÍA / NO VISITARLO	FRONTERA
TALINA	Christian Isaac Villeda Sandoval	Urología	Hosp. Ángeles del Pedregal
ORALIA	Christian Rodriguez Castillo	Ginecologia	Circuitos Centro Comercial 20, Tlalnepantla
TALINA	Christian Ronald Choque Hidalgo	Ginecología y Obstetricia	HOSPITAL ANGELES DEL PEDREGAL TORRE CLINICA ANGELES CON 990
ORALIA	Cinthia LIzeth Juarez Leal	Ginecologia	Sor Juan Ines de la Cruz 280, Tlalnepantla
ORALIA	Cinthia Yuridia Maciel Valentin	Ginecologia	Circuito Misioneros 5, Ciudad Satelite
LUIS	Cinthya Verver Moreno	Ginecología y Obstetricia	Ángeles Universidad
LUIS	Cintia Maria Sepulveda Rivera	Ginecología y Obstetricia	Ángeles Universidad
LUIS	Cintia Mejia Garcia	Ginecología y Obstetricia	MAC La Viga
ANGEL	CLAUDIA ELENA	GINECO OBSTETRICIA	TORRE TUXPAN 16
ANGEL	CLAUDIA MORELOS MELLADO	GINECO OBSTETRICIA	TORRE DURANGO 290
ANGEL	CLAUDIA OCHOA NAVARRETE	GINECO OBSTETRICIA	TORRE QUERETARO
LUIS	CLAUDIO ENRIQUE MERAYO CHALICO	UROLOGÍA	AV RIO CHURUBUSCO
ORALIA	Concepción Patricia Del Rio Gómez	Ginecología y Obstetricia	Rio Bmaba 639. Lindavista
ANGEL	CONSUELO CARCAMO	GINECO OBSTETRICIA	TORRE TUXPAN 16
LUIS	Coral Garcia Rivera	Ginecología y Obstetricia	San Angel Inn Acora
ORALIA	Cuauhtemoc Villagomez Rodriguez	Ginecologia	Circuito Misioneros 5, Ciudad Satelite
LUIS	Cynthia Peña Vega	Ginecología y Obstetricia	San Angel Inn Acora
LUIS	Cynthia Verver Moreno	Ginecología y Obstetricia	San Angel Inn Acora
ORALIA	Damaris Alejandra Ortiz Núñez 	Ginecología y Obstetricia	Rio Bmaba 639. Lindavista
LUIS	DANIEL  OSCAR AGUILAR	UROLOGÍA	AV UNIVERSIDAD
TALINA	Daniel Alejandro Arreola Ramírez	Ginecología y Obstetricia	Healthec by TecSalud Av. Contreras 300, San Jerónimo Lídice, Magdalena Contreras / MEDICA SUR
TALINA	Daniel Calvo Mena	Urología	Hospital Ángeles Acoxpa
ORALIA	Daniel Cortes Velazquez	Ginecologia	Av. Lomas verdes 2165, Naucalpan
LUIS	DANIEL JUANXOCHIPILTECATL Y MUÑOZ	UROLOGÍA	CAPULIN
LUIS	DANIEL QUINTAL GUTIERREZ	UROLOGÍA	MONTECITO
LUIS	Daniel Vieyra Cortes	Ginecología y Obstetricia	Ángeles Universidad
ORALIA	Daniela Blancas Camacho	Gineco _Obstetricia	Maravatio 92, Claveria, Azcapotzalco, 02080 Ciudad de México, CDMX
LUIS	Daniela Charavati	Ginecología y Obstetricia	HMG
LUIS	Danielle Jáuregui Casillas	Ginecología y Obstetricia	Consultorio privado
ORALIA	David Ancona Dorantes	Ginecologia	Av. Lomas verdes 2165, Naucalpan
TALINA	David Fernando Taboada Lozano	Ginecología / Urología (uroginecología)	Hospital MAC Cuemanco
LUIS	David Islas Cruz	Ginecología y Obstetricia	San Angel Inn Acora
ANGEL	DELIA VIRGINIA CRUZ RODRIGUEZ	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
ANGEL	DENIS LOCAYO CABRERA	GINECO OBSTETRICIA	EJE 3 SUR 218 ROMA SUR
ANGEL	DIANA CRUZ CLAVEL	GINECO OBSTETRICIA	TEHUANTEPEC 251
LUIS	Diana de la Paz Theurel	Ginecologia y Obstetricia	MAC La Viga
ANGEL	DIANA IRIS HERNANDEZ	GINECO OBSTETRICIA	TORRE TUXPAN 6
ORALIA	Diana Jimenez Gonzalez	Ginecologia	Sor Juan Ines de la Cruz 280, Tlalnepantla
TALINA	Diana Karen Cortés Contreras	Ginecología y Obstetricia	Hospital MAC Periférico Sur
ANGEL	DIANA TIRO HERMANDEZ	GINECO OBSTETRICIA	TEHUANTEPEC 251
ANGEL	DIOGENES RAMIREZ PALACIOS	GINECO OBSTETRICIA	TORRE TUXPAN 6
LUIS	Dionisio Mora Hernández	Ginecologia y Obstetricia	MAC La Viga
ANGEL	DORI RIVERA	GINECO OBSTETRICIA	QUERETARO 58 ROMA NORTE
ANGEL	DR. PALMA	GINECO OBSTETRICIA	TORRE TUXPAN 16
LUIS	Dulce Dalia Hernández Hernández	Ginecologia y Obstetricia	MAC La Viga
LUIS	Dulce Gonzalez Miranda	Ginecología y Obstetricia	Ángeles Universidad
LUIS	Dulce Maria Camarena Cabrera	Ginecología y Obstetricia	HMG
ANGEL	EDGAR ARELLANO	GINECO OBSTETRICIA	TORRE TUXPAN 16
LUIS	EDGAR IVAN BRAVO CASTRO	Ginecología y Obstetricia	San Angel Inn Acora
ANGEL	EDGAR MENDOZA REYES	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
ANGEL	EDITH CERVANTES	GINECO OBSTETRICIA	TORRE TUXPAN 10
ANGEL	EDNA AVILA LEGUIZAMO	GINECOLOGÍA Y OBSTETRICIA	QUERETARO
LUIS	Edna Guzman Porres	Ginecología y Obstetricia	San Angel Inn Acora
TALINA	Eduardo Ordóñez Campos	Urología / OPERA EN MEDICA SUR	Hosp. Ángeles del Pedregal
ORALIA	Eduardo Paradela	Ginecologia	Ejercito Nacional 613, Polanco
ANGEL	EDWIN MENDOZA RAMIREZ	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
TALINA	Efren Kassim Yaber Gómez	Urología	Hosp. Ángeles del Pedregal
LUIS	Elaine Castillo Alvarez	Ginecología y Obstetricia	San Angel Inn Acora
LUIS	Elba Berenice Alvarado Quiroz	Ginecología y Obstetricia	San Angel Inn Acora
ORALIA	Eligio Islas Hernandez	Gineco _Obstetricia	Calle Callao 693, Lindavista
LUIS	Elio Rafael Ponce Juárez	Ginecología y Obstetricia	San Ángel Inn Universidad
ORALIA	Elisa Mendez Alvarez	Ginecologia	Circuitos Centro Comercial 20, Tlalnepantla
ANGEL	ELIZABETH BRENDA BARANDO DELGADO	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
ANGEL	ELIZABETH CACHO	GINECO OBSTETRICIA	MANZANILLO 100
ORALIA	Elizabeth Cruz Lopez	Ginecologia	Sor Juan Ines de la Cruz 280, Tlalnepantla
ORALIA	Elizabeth Cruz Lopez	Ginecologia	Sor Juan Ines de la Cruz 280, Tlalnepantla
ORALIA	Elizabeth Jimenez Legaspi	Gineco _Obstetricia	Calle Callao 693, Lindavista
LUIS	Elizabeth Perez Torres	Uro - Ginecología	San Angel Inn Acora
ANGEL	ELIZABETH VARELA MONDRAGON	GINECO OBSTETRICIA	TORRE DURANGO 290
TALINA	Elly Guerrero Martínez	Ginecología y Obstetricia	Hosp. Ángeles del Pedregal
ANGEL	ELSA DIAZ LOPEZ	GINECO OBSTETRICIA	GOBERNADOR GREGORIO V. 29 MIGUEL HIDALGO
LUIS	Elvira Marquez Aguirre	Ginecología y Obstetricia	San Angel Inn Acora
TALINA	Emilio Ramírez Garduño	Urología	Hosp. Ángeles del Pedregal
ORALIA	Emma Carolina Baltazar Guerrero	Ginecologia	Circuitos Centro Comercial 20, Tlalnepantla
ORALIA	Encarnacion Jesus Parra Pelcastre	Ginecologia	Rio Bamba 639, Lindavista
ORALIA	Eneyda Martinez Bnaderas	Ginecologia	Sor Juan Ines de la Cruz 280, Tlalnepantla
TALINA	Enrique Alfredo Schultz Lanz	Ginecología y Obstetricia	Hosp. Ángeles del Pedregal
ORALIA	Enrique Martinez	Ginecologia	
LUIS	Enrique Reyez Muñoz	Ginecología y Obstetricia	HMG
ANGEL	ENRIQUE RIVERA WEBER	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
ORALIA	Enrique Rodriguez Abiita	Ginecologia	Sor Juan Ines de la Cruz 280, Tlalnepantla
ANGEL	ERENDIRA GUZMAN SUSANA	UROLOGÍA / VISITARLA	MARCOS CARRILLO
TALINA	Eric Iván Trujillo Vázquez	Urología	Hospital Ángeles Acoxpa
LUIS	Erika Estrada	Ginecología y Obstetricia	San Ángel Inn Universidad
LUIS	Erika Sarai Cruz Amaya	Ginecologia y Obstetricia	MAC La Viga
LUIS	Erika Valencia	Ginecología y Obstetricia	San Ángel Inn Universidad
LUIS	Ernesto Rodolfo Rivera Medina	Ginecología y Obstetricia	Ángeles Universidad
LUIS	Esther Helga Enriquez Jimenez	Ginecologia y Obstetricia	MAC La Viga
ANGEL	EUGENIO BARRERA PEREZ	GINECO OBSTETRICIA	TLACOTALPAN 59 ROMA SUR
ORALIA	EVANGELINA VALDOVINOS CERVANTES	GINECOLOGÍA Y OBSTETRICIA	MONTIEL
ANGEL	EVELIO CABEZAS GARCIA	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
TALINA	FABIOLA RIVERA SILVIA	GINECOLOGÍA ONCOLÓGICA	AV PERIFERICO SUR
ANGEL	FABIOLA ROJAS GONZALES	GINECO OBSTETRICIA	TORRE DURANGO 64
LUIS	Fatima Giron Avila	Ginecología y Obstetricia	San Angel Inn Acora
ANGEL	FAUSTO JONATAN BALANZARIO CUEVAS	GINECO OBSTETRICIA	QUERETARO 156, ROMA NORTE
TALINA	FEDERICO BERTRAND NORIEGA	Urología / ALGUNA VEZ TRABAJO CON NOSOTRO	Hosp. Ángeles del Pedregal
TALINA	FEDERICO BERTRAND NORIEGA	UROLOGÍA	CAMINO A SANTA TERESA
LUIS	FELIPE ALFAN GUZMAN 	GINECOLOGÍA Y OBSTETRICIA	AV PATRIOTISMO
ORALIA	Felix Martinez Moreno	Ginecologia	Circuitos Centro Comercial 20, Tlalnepantla
ORALIA	Fernanda Hernandez	Gineco _Obstetricia	Homero 1425, Polanco
ORALIA	Fernanda Linares	Gineco _Obstetricia	Rio Bamba 639, Lindavista
ANGEL	FERNANDO DE JESUS RUIZ GARCIA	UROLOGÍA	QUERETARO
LUIS	Fernando Desales Gonzalez	Ginecología y Obstetricia	Ángeles Universidad
LUIS	Fernando Emmanuel Garduño Valle	Ginecología y Obstetricia	San Angel Inn Acora
TALINA	Fernando González Meza García	Urología	Hospital Ángeles Acoxpa
ANGEL	FERNANDO LOPEZ MARTINEZ	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
TALINA	Fernando López Reyes	Urología	Hospital Ángeles Acoxpa
ANGEL	FERNANDO RUIZ	GINECO OBSTETRICIA	TEHUANTEPEC 251
TALINA	Florencia Covarrubias Haiek	Ginecología y Obstetricia	Hospital Angeles Pedregal
ANGEL	FRAGOSO HERNANDEZ MARIO	GINECO OBSTETRICIA	FRONTERA 74 ROMA NORTE
LUIS	Francis Erika Angulo Rujano	Ginecología y Obstetricia	San Ángel Inn Universidad
TALINA	Francisco Abel Martínez Ávila	Ginecología y Obstetricia	Hosp. Ángeles del Pedregal
TALINA	FRANCISCO GONZALEZ PARTIDA	GINECOLOGÍA Y OBSTETRICIA	CAMINO A SANTA TERESA
ORALIA	Francisco Javier Alvarado Gay	Ginecología y Obstetricia	Rio Bmaba 639. Lindavista
ANGEL	FRANCISCO JAVIER BORRAJO CRVAJAL	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
ORALIA	Francisco Javier Díaz Rivas	Ginecologia	Av. Dr. Gustavo Baz 309-TR A1
ANGEL	FRANCISCO JAVIER GUDIÑO MOLINA	GINECO OBSTETRICIA	TORRE DURANGO 49
ANGEL	FRANCISCO JAVIER HERNANDEZ DANIEL	UROLOGÍA	BAJIO
TALINA	Francisco Manuel Bustamante Romero	Urología 	Hosp. Ángeles del Pedregal
ORALIA	Gabriel Gallo	Ginecologia	Ejercito Nacional 613, Polanco
ANGEL	GABRIEL QUINTO CATALAN	UROLOGÍA / VISITARLO	FRONTERA
ANGEL	GABRIELA ALMA CONSUELO	GINECOLOGÍA Y OBSTETRICIA	TUXPAN
ORALIA	Gabriela Angelica Zavala Acosta	Ginecologia	Sor Juan Ines de la Cruz 280, Tlalnepantla
LUIS	Gabriela Arredondo Vazquez	Ginecología y Obstetricia	HMG
ORALIA	Gabriela Berenice Varga Gutierrez	Ginecologia	Circuito Misioneros 5, Ciudad Satelite
ANGEL	GABRIELA BERENICE VAZQUEZ DE LA PEÑA	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
ORALIA	Gabriela Elisa Espinosa Vazquez	Ginecologia	Viveros de Uman 28, colonia viveros del valle Tlalnepantla
LUIS	Gamaliel Rodriguez Reyes	Ginecología y Obstetricia	Ángeles Universidad
ORALIA	Gerardo Andres Alba Jasso	Ginecologia	Sor Juan Ines de la Cruz 280, Tlalnepantla
LUIS	GERARDO ESPINOSA ESPARZA	GINECOLOGÍA Y OBSTETRICIA	MONTECITO
TALINA	Gerardo Fernández Noyola	Urología	Hospital Ángeles Acoxpa
ORALIA	Gerardo Gorostizaga González	Ginecología y Obstetricia	Temístocles 210, Polanco IV Secc, CDMX
ANGEL	GERARDO MENDEZ ESPINOZA	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
ANGEL	GERARDO QUIROZ GARZA	GINECO OBSTETRICIA	TORRE DURANGO 290
ORALIA	Gerardo Reyes Díaz	Ginecologia	Sor Juan Ines de la Cruz 280, Tlalnepantla
TALINA	Gerardo Tena González Méndez	Urología	Hosp. Ángeles del Pedregal
ANGEL	GERARDO TINOCO JARAMILLO	GINECO OBSTETRICIA	TLACOTALPAN 59 ROMA SUR
ORALIA	GERMAN GABRIEL PALACIOS LOPEZ 	GINECOLOGÍA Y OBSTETRICIA	AV LOMAS VERDES
TALINA	GILBERTO TENA ALAVEZ	GINECOLOGÍA Y OBSTETRICIA	PERIFERICO SUR
ORALIA	Gillermos Najera Gonzalez	Ginecologia	Sor Juan Ines de la Cruz 280, Tlalnepantla
LUIS	Giselle Lozano Alcocer	Ginecología y Obstetricia	San Angel Inn Acora
ANGEL	GLORIA ELENA CRUZ PIÑONES	GINECO OBSTETRICIA	QUERETARO 156, ROMA NORTE
LUIS	Gloria Elena Rivero Song	Ginecología y Obstetricia	Ángeles Universidad
ORALIA	Gómez Reyes Ma. Ileana	Ginecología y Obstetricia	Rio Bmaba 639. Lindavista
LUIS	Gonzalo Esteban Pol Kippes	Ginecología y Obstetricia	Ángeles Universidad
ANGEL	GONZALO MORAN	GINECO OBSTETRICIA	TEHUANTEPEC 251
LUIS	Griselda Martínez Aragón	Ginecología y Obstetricia	Ángeles Universidad
LUIS	GRISELDA PEREZ ALCANTARA	GINECOLOGÍA Y OBSTETRICIA	MONTECITO
LUIS	Guadalupe Cabrera Toledo		HMG
LUIS	Guadalupe Guerrero Reyes	Ginecología y Obstetricia	Ángeles Universidad
LUIS	GUADALUPE RAMIREZ CEDILLO	GINECOLOGÍA Y OBSTETRICIA	MONTECITO
ANGEL	GUILLERMINA ARGUELLES	GINECO OBSTETRICIA	TORRE TUXPAN 16
ANGEL	GUILLERMINA RAMIREZ ARGÜELLES	GINECOLOGÍA Y OBSTETRICIA	TUXPAN
ORALIA	Guillermo Alejandro Goitita	Ginecologia	Circuitos Centro Comercial 20, Tlalnepantla
LUIS	Guillermo Goitia Landeros	Biología de Reproducción	San Angel Inn Acora
ORALIA	Guillermo Moreno Flores	Ginecologia	Circuito Misioneros 5, Ciudad Satelite
TALINA	Gustavo Adolfo Durán Hernández	Urología	Hosp. Ángeles del Pedregal
ORALIA	Gutiérrez Ramírez Antonio	Ginecología y Obstetricia	Rio Bmaba 639. Lindavista
LUIS	Harold Bigmad Villaroel Lopez	Ginecologia y Obstetricia	MAC La Viga
LUIS	Héctor Iván Guerra Malacara	Ginecología y Obstetricia	Consultorio privado
ORALIA	Héctor Peña Dehesa	Ginecología /Medicina Mterno FETAL	Rio Bmaba 639. Lindavista
ANGEL	HECTOR RODRIGUEZ AGUILAF	GINECO OBSTETRICIA	EJE 3 SUR 218 ROMA SUR
TALINA	Héctor Sandoval Barba	Urología	Hosp. Ángeles del Pedregal
ANGEL	HELIO PONCE	GINECO OBSTETRICIA	QUERETARO 58 ROMA NORTE
ANGEL	HERMISENDA MARIA BERMUDEZ	GINECO OBSTETRICIA	QUERETARO 156, ROMA NORTE
ANGEL	HILARY NUÑEZ ARAUJO	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
ANGEL	HUGO ERNESTO ALEJOS GARDUÑO	GINECO OBSTETRICIA	EJE 3 SUR 218 ROMA SUR
ORALIA	Hugo Salamanca Ordoñez	Ginecologia	Circuitos Centro Comercial 20, Tlalnepantla
ORALIA	Hugo Salazar Ramirez	Ginecologia	Sor Juan Ines de la Cruz 280, Tlalnepantla
LUIS	Humberto Ortiz Rodriguez	Ginecología y Obstetricia	San Angel Inn Acora
ORALIA	IDALIA HERNANDEZ KARLA	GINECOLOGÍA Y OBSTETRICIA	ENRIQUE SADA MUGUERZA
ORALIA	IGNACIO EDUARDO EGUIARTE	GINECOLOGÍA Y OBSTETRICIA	MANUEL E IZAGUIRRE
ANGEL	IGNACIO MORALES ALVAREZ	GINECO OBSTETRICIA	EJE 3 SUR 218 ROMA SUR
ORALIA	Ilse Guadalupe de Jesus Ceron	Ginecologia	Circuito Misioneros 5, Ciudad Satelite
ANGEL	IMELDA ACOSTA	GINECO OBSTETRICIA	TORRE TUXPAN 16
LUIS	Indhira Azucena Garcia Banda	Ginecología y Obstetricia	HMG
LUIS	Indira Jimenez Radilla	Ginecología y Obstetricia	San Angel Inn Acora
ORALIA	Isaias Preciado Abril del Carmen	Ginecología	Rio Bmaba 639. Lindavista
ANGEL	ISMAEL GONZALEZ JULIO	UROLOGÍA	TUXPAN
LUIS	Issac Rodríguez	Ginecología y Obstetricia	San Ángel Inn Universidad
ORALIA	IVAN CASTRO EDGAR	UROLOGÍA	AV LOMAS VERDES
LUIS	Ivan Ruiseco Herrera	Ginecología y Obstetricia	San Ángel Inn Universidad
TALINA	Jaime Claudio Granados Marín	Ginecología y Obstetricia	Hosp. Ángeles del Pedregal
TALINA	JAIME USCANGA YEPEZ	UROLOGÍA	PRL PASEO DE LA REFORMA
LUIS	Janeth Marin Hernandez	Ginecología y Obstetricia	San Angel Inn Acora
LUIS	Janeth Márquez Acosta	Biología de Reproducción	San Ángel Inn Universidad
ANGEL	JAVIER FRANCISCO GUDIÑO MOLINA 	GINECOLOGÍA Y OBSTETRICIA	DURANGO
LUIS	Jenifer Alejandra Bustamante Mendoza	Ginecología y Obstetricia	San Ángel Inn Universidad
ANGEL	JENIFER REYES	GINECO OBSTETRICIA	QUERETARO 58 ROMA NORTE
ORALIA	Jesis Macias Duvignau	Ginecologia	Circuitos Centro Comercial 20, Tlalnepantla
ORALIA	Jessica Abril Rosas Alvarez	Ginecologia	Sor Juan Ines de la Cruz 280, Tlalnepantla
LUIS	Jessica Aideé Mora Galván	Ginecología y Obstetricia	Capital Medical Center
LUIS	Jesús Cisneros	Biología de Reproducción	San Ángel Inn Universidad
ORALIA	JESUS JOSE GONZALEZ AVENDAÑO	GINECOLOGÍA Y OBSTETRICIA	RIO BAMBA
ORALIA	JESUS JOSE GONZALEZ AVENDAÑO	GINECOLOGÍA Y OBSTETRICIA	AV LOMAS VERDES
LUIS	Jonadad Jasso Jimenez	Ginecologia y Obstetricia	MAC La Viga
ANGEL	JONATHAN ASTUDILLO IBARRONDO	GINECO OBSTETRICIA	TORRE DURANGO 64
ORALIA	Jorge Artuto Esparza Iturbe	Ginecologia	Av. Lomas verdes 2165, Naucalpan
ANGEL	JORGE BARBOSA VILCHIS	GINECO OBSTETRICIA	TORRE TUXPAN 10
LUIS	JORGE CARLOS LOPEZ VALLEJO CASTRO	UROLOGÍA	AV UNIVERSIDAD
TALINA	Jorge Gustavo Morales Montor	Urología / TIENE EQUIPO	Hospital Ángeles Acoxpa
ANGEL	JORGE JASPERSEN GASTELUM	UROLOGÍA	QUERETARO
ORALIA	Jorge Lezama	Ginecologia	Ejercito Nacional 613, Polanco
ANGEL	JORGE LUIS VEGA CUEVAS	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
ORALIA	Jorge Morales	Gineco _Obstetricia	Calz. Azcapotzalco - La Villa 10, Col del Maestro, Azcapotzalco, 02040 Ciudad de México, CDMX
TALINA	Jorge Moreno Palacios	Urología /TRABAJA CON NOSOTROS	Hosp. Ángeles del Pedregal
LUIS	Ana Cristina Ramírez Echeverría	Ginecología y Obstetricia	HMG
ANGEL	BLANCA ESTELA VEGA	GINECO OBSTETRICIA	TEHUANTEPEC 251
ANGEL	JORGE URTADO CONDE	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
TALINA	Jorge Villavicencio Castañeda	Ginecología y Obstetricia	Hosp. Ángeles del Pedregal
ORALIA	Jose Alfredo Ruiz	Ginecologia	Circuito Misioneros 5, Ciudad Satelite
TALINA	JOSE ALFREDO ZUÑIGA MONTIEL	GINECOLOGÍA Y OBSTETRICIA	CALZ ACOXPA
TALINA	José Alfredo Zúñiga Montiel	Ginecología y Obstetricia	Hospital Ángeles Acoxpa
LUIS	Jose Antonio Ramirez Calvo	Ginecología y Obstetricia	San Angel Inn Acora
ORALIA	José Carlos Guerrero Dorado	Ginecología y Obstetricia	Temístocles 210, Polanco IV Secc, CDMX
ORALIA	Jose Carlos Salazar	Ginecologia	Ejercito Nacional 613, Polanco
LUIS	Jose Daniel Flores Alatriste	Ginecología y Obstetricia	Ángeles Universidad
ORALIA	Jose de Jesus del Real	Gineco _Obstetricia	Homero 530, Polanco
ORALIA	Jose de Jesus Gonzalez Avendaño	Ginecologia	Av. Lomas verdes 2165, Naucalpan
ANGEL	JOSE FUGAROLAS MARIN	GINECO OBSTETRICIA	TORRE TUXPAN 10
TALINA	José Gómez Sánchez	Urología	Hospital Ángeles Acoxpa
LUIS	Jose Gustavo Martinez Lugo	Ginecología y Obstetricia	San Angel Inn Acora
ANGEL	JOSE HUMBERTO OCAMPO MAZARIEGOS	GINECO OBSTETRICIA	COZUMEL 62 ROMA NORTE
LUIS	José Javier Melo Camacho	Ginecologia y Obstetricia	MAC La Viga
ANGEL	JOSE JESUS MACIAS DUVIGNAU	GINECOLOGÍA Y OBSTETRICIA	AV CHAPULTEPEC
TALINA	José Juan Valdés García	Ginecología y Obstetricia	Hosp. Ángeles del Pedregal
ORALIA	Jose Luis Peñuluri Santoyo	Ginecologia	Rio Bamba 639, Lindavista
LUIS	Jose Manuel Garcia Wrooman	Ginecología y Obstetricia	Ángeles Universidad
TALINA	José Manuel Huerta Hentschel	Ginecología y Obstetricia	Hosp. Ángeles del Pedregal
ANGEL	JOSE MANUEL LORENZO	GINECO OBSTETRICIA	QUERETARO 58 ROMA NORTE
ANGEL	JOSE MARIA MEZA	GINECO OBSTETRICIA	TORRE TUXPAN 16
LUIS	Jose Miguel Navarro Martin	Ginecología y Obstetricia	Ángeles Universidad
ORALIA	Jose Miguel Reyes Garita	Ginecologia	Circuitos Centro Comercial 20, Tlalnepantla
TALINA	José Ramón Vérez Ruiz	Ginecología y Obstetricia	Hosp. Ángeles del Pedregal
ANGEL	JOSE ROBERTO SILVESTRI TOMASSANI	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
LUIS	Jose Rodrigo Aquino	Ginecología y Obstetricia	San Angel Inn Acora
LUIS	José Ruiz Medina	Ginecología y Obstetricia	San Ángel Inn Universidad
ORALIA	Joseph Arturo Rosa Cordova	Ginecologia	Circuito Misioneros 5, Ciudad Satelite
TALINA	Josué Christian Hernández Bañales	Ginecología y Obstetricia	Hosp. Ángeles del Pedregal
ANGEL	JUAN CARLOS BARROS DELGADILLO	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
LUIS	Juan Carlos De Leon Carbajal	Ginecología y Obstetricia	Ángeles Universidad
ANGEL	JUAN CARLOS IZQUIERO PUENTE	GINECO OBSTETRICIA	TLACOTALPAN 59 ROMA SUR
ORALIA	Juan Carlos Negrete	Ginecologia	Sor Juan Ines de la Cruz 280, Tlalnepantla
ANGEL	JUAN ERNESTO SANCHEZ TAPIA	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
LUIS	Juan Francisco Mendez Sanchez	Ginecología y Obstetricia	San Angel Inn Acora
LUIS	Juan Gabriel Perez Vazquez	Ginecología y Obstetricia	San Angel Inn Acora
ANGEL	JUAN HURTADO GOROSTIETA	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
TALINA	Juan Ignacio Monjaras Guerra	Urología	Hosp. Ángeles del Pedregal
TALINA	JUAN IGNACIO STENNER PEREZ GAVILAN	UROLOGÍA	PUENTE DE PIEDRA
TALINA	Daniel Fabián Ramírez Moreno	Ginecología y Obstetricia	Hospital Ángeles Acoxpa
ANGEL	JUAN JIMENEZ HUERTA	GINECOLOGÍA Y OBSTETRICIA	DURANGO
ORALIA	Deborah Marín Robles	Gineco _Obstetricia	Calle Callao 693, Lindavista
ORALIA	Juan José Gorostizaga Lezama	Ginecología y Obstetricia	Temístocles 210, Polanco IV Secc, CDMX
LUIS	Juan José Solano Perez	Ginecologia y Obstetricia	MAC La Viga
ANGEL	EDNA AVILA	GINECO OBSTETRICIA	QUERETARO 156, ROMA NORTE
ORALIA	Eduardo Nieto Vazquez	Ginecologia	Circuitos Centro Comercial 20, Tlalnepantla
ANGEL	JUAN MADRAZO RODRIGUEZ	GINECO OBSTETRICIA	TORRE DURANGO 64
ORALIA	Juan Manuel Hernandez Herrera	Gineco _Obstetricia	Alexander Von Humboldt 88, Lomas Verdes 3ra Secc, 53120 Naucalpan de Juárez, Méx
TALINA	Juan Manuel Ochoa López	Urología	Hosp. Ángeles del Pedregal
LUIS	JUAN MUÑOZ XOCHIPILTECATL DANIEL	UROLOGÍA	CAPULIN 46, INT 211, BENITO JUAREZ
TALINA	Juan Osvaldo Cuevas Alpuche	Urología	Hosp. Ángeles del Pedregal
TALINA	JUDITH NARANJO SANCHEZ	GINECOLOGÍA Y OBSTETRICIA	AV CONTRERAS
ORALIA	Judith Yasmin Pallares	Ginecologia	Circuitos Centro Comercial 20, Tlalnepantla
LUIS	Julian Velazquez Fonseca	Ginecología y Obstetricia	HMG
ANGEL	JULIETA GUTIERREZ ZAMORA	GINECO OBSTETRICIA	TORRE TUXPAN 10
ORALIA	Julio Camacho	Gineco _Obstetricia	Petrarca 133, Polanco
ORALIA	Karelia Mendoza Baranda	GINECOLOGÍA Y OBSTETRICIA	Rio Bmaba 639. Lindavista
ORALIA	Karen Josseline Delgado	Ginecologia	Sor Juan Ines de la Cruz 280, Tlalnepantla
LUIS	Karen Perez Valdez	Ginecología y Obstetricia	HMG
ORALIA	KAREN VIVIANA LIMON RODRIGUEZ 	GINECOLOGÍA Y OBSTETRICIA	AV SOR JUANA INES DE LAS CRUZ
LUIS	Karina Perez Sousa	Ginecología y Obstetricia	Ángeles Universidad
LUIS	Karla Carmona Bravo	Ginecología y Obstetricia	San Angel Inn Acora
ANGEL	KARLA CECILA FONT LOPEZ	GINECO OBSTETRICIA	TORRE DURANGO 64
ORALIA	Karla Libeth Michorena Sarmiento	Ginecologia	Sor Juan Ines de la Cruz 280, Tlalnepantla
ORALIA	Karla Maria Bujalil Montero	Ginecologia	Circuito Misioneros 5, Ciudad Satelite
ANGEL	KARLA MORENO	GINECO OBSTETRICIA	TORRE TUXPAN 6
ANGEL	KARLA OSIRIS PEÑA PELAEZ	GINECO OBSTETRICIA	FRONTERA 74 ROMA NORTE
ORALIA	Karla Renee Arau Contreras	Ginecologia	Sor Juan Ines de la Cruz 280, Tlalnepantla
ORALIA	Karla Rodriguez	Gineco _Obstetricia	Av. Clavería 154, Claveria, Azcapotzalco, 06910 Ciudad de México, CDMX
LUIS	Kenia Lizeth Benitez Castro	Ginecología y Obstetricia	Ángeles Universidad
ANGEL	LAURA CORETTA MEJIARIO	UROLOGÍA	DURANGO
LUIS	LAURA GARCIA MORENO	GINECOLOGÍA Y OBSTETRICIA	MONTECITO
TALINA	Laura Hernández Gurrola	Biología de Reproducción, Ginecología y Obstetricia	Hospital Ángeles Acoxpa
LUIS	Laura Reyes Ramírez	Ginecología y Obstetricia	San Ángel Inn Universidad
ANGEL	LAURA ROMERO RODRIGUEZ	GINECO OBSTETRICIA	TEPIC 114
ORALIA	Laura Romero Rodriguez	Ginecologia	Rio Bamba 639, Lindavista
LUIS	Gabriela Leon Flores	Ginecología y Obstetricia	Ángeles Universidad
LUIS	Ignacio Reyes Urrutia	Ginecología y Obstetricia	Ángeles Universidad
ANGEL	LAURO MANUEL LORIA CASANOVA	GINECO OBSTETRICIA	QUERETARO 156, ROMA NORTE
TALINA	Lenin Rojas Buendía	Urología	Hospital Ángeles Acoxpa
ORALIA	Leonardo Avila Lizarraga	Ginecologia	Ejercito Nacional 613, Polanco
LUIS	Leonardo Isais Romero Lopez	Ginecologia y Obstetricia	MAC La Viga
ORALIA	Leonel Alfonso	Ginecologia	Ejercito Nacional 613, Polanco
ORALIA	Leonor Sarahi Martinez Mejia	Ginecologia	Sor Juan Ines de la Cruz 280, Tlalnepantla
ORALIA	Leopoldo Alejandro Vázquez Estrada	Ginecología/biologia de la reproduccion	Rio Bmaba 639. Lindavista
LUIS	Leopoldo Gatica Galina	Ginecología y Obstetricia	HMG
ORALIA	Leopoldo Rio de la Loza	Ginecologia	Circuitos Centro Comercial 20, Tlalnepantla
ORALIA	Leopoldo Rio de la Loza Cava	Gineco _Obstetricia	Alexander Von Humboldt 88, Lomas Verdes 3ra Secc, 53120 Naucalpan de Juárez, Méx
ORALIA	Lesli Pamela González Domínguez	Ginecología	Temístocles 210, Polanco IV Secc, CDMX
ANGEL	LESLIE EUNICE OMAÑA YOVAL	GINECO OBSTETRICIA	TLACOTALPAN 59 ROMA SUR
ORALIA	MAGDA ICEL SALGADO JACOBO	GINECOLOGÍA Y OBSTETRICIA	AV PRIMERO DE MAYO
TALINA	Malenys Sánchez	Ginecología y Obstetricia (consulta privada)	Hospital MAC Periférico Sur
LUIS	Jessica Jazmin Chavez	Ginecología y Obstetricia	San Angel Inn Acora
TALINA	Jorge Alberto Campos Cañas	Biología de Reproducción, Ginecología y Obstetricia	Hospital Ángeles Acoxpa
ORALIA	MANUEL DE JESUS ARRIOLA ZAMARRIPA	GINECOLOGÍA Y OBSTETRICIA	RIO BAMBA
ANGEL	MANUEL GOMEZ RODRIGUEZ	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
ORALIA	Manuel Lozano	Ginecologia	Ejercito Nacional 613, Polanco
ORALIA	Manuel Ramos Garduza	Ginecologia	Circuitos Centro Comercial 20, Tlalnepantla
ORALIA	Marcela Gonzalez Espejel	Ginecologia	Sor Juan Ines de la Cruz 280, Tlalnepantla
TALINA	MARCO ANTONIO PEREZ CISNEROS 	GINECOLOGÍA Y OBSTETRICIA	PERIFERICO SUR
ANGEL	MARGARITA ELIZABETH FLORES ZALETA	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
LUIS	MARIA BELEM MARTINEZ ROMERO	GINECOLOGÍA Y OBSTETRICIA	MONTECITO
TALINA	María de la Caridad Carranco Salinas	Ginecología y Obstetricia	Hospital Angeles Pedregal Con715 D
ANGEL	MARIA DE LOS ANGELES PEREZ RAMIREZ	GINECO OBSTETRICIA	TLACOTALPAN 59 ROMA SUR
ANGEL	MARIA DEL CARMEN MARTINEZ CHIÑAS	GINECO OBSTETRICIA	TEPIC 139
ANGEL	MARIA DEL CARMEN PEREZ REYES	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
ANGEL	MARIA DEL PILAR VELAZQUEZ SANCHEZ	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
ORALIA	María Digna Nava Barahona	Ginecología y Obstetricia	Temístocles 210, Polanco IV Secc, CDMX
ORALIA	Maria Dolores Alarcon Alcantara	Ginecologia	Enrique Sada Muguerza 17
ANGEL	MARIA EUGENIA GONZALES MORALES	GINECO OBSTETRICIA	TLACOTALPAN 59 ROMA SUR
LUIS	Maria Fernanda Fernandez Corzas	Ginecología y Obstetricia	Ángeles Universidad
ORALIA	Maria Fernanda Rio de la Loza	Gineco _Obstetricia	Alexander Von Humboldt 88, Lomas Verdes 3ra Secc, 53120 Naucalpan de Juárez, Méx
ANGEL	MARIA ISABEL PEREZ ORTEGA	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
ORALIA	Maria Jose Rodriguez Gutierres	Ginecologia	Sor Juan Ines de la Cruz 280, Tlalnepantla
ANGEL	MARIA JUANA HERNANDEZ VALENCIA	GINECO OBSTETRICIA	TLACOTALPAN 59 ROMA SUR
ANGEL	MARIA JULETA HERNANDEZ CUMINGS	GINECO OBSTETRICIA	TORRE TEPIC 113
LUIS	Maria Luisa Fuentes	Ginecología y Obstetricia	Consultorio privado
LUIS	Maria Rossana Valiente Aguilar	Ginecología y Obstetricia	San Angel Inn Acora
ANGEL	MARIA TERESA MENDEZ GOMEZ	GINECO OBSTETRICIA	TUXPAN 39
ANGEL	MARIA TERESA SOLANO	GINECO OBSTETRICIA	MANZANILLO 101
TALINA	María Victoria Marchese	Ginecología y Obstetricia	Paseo de los Tamarindos 384 p9, col, Bosques de las Lomas, Cuajimalpa de Morelos
ANGEL	MARIBEL IBARRA SARLATCONS	GINECO OBSTETRICIA	TEPIC 116
ANGEL	MARICRUZ BARRAZA	GINECO OBSTETRICIA	QUERETARO 156, ROMA NORTE
LUIS	Maricruz Dañino Montes	Ginecología y Obstetricia	San Angel Inn Acora
TALINA	Mario Alberto Ramírez Negrín	Urología	Hosp. Ángeles del Pedregal
ORALIA	Mario Antonio Lopez Salas	Ginecologia	Ejercito Nacional 613, Polanco
ANGEL	MARIO GARAY ENRIQUEZ	GINECOLOGÍA Y OBSTETRICIA	RIO PANUCO
ORALIA	MARIO LUGO RANGEL	UROLOGÍA	VIA GUSTAVO BAZ PRADA
ANGEL	MARIO MARTINEZ RUIZ	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
LUIS	Marisol Ayala Juarez	Ginecología y Obstetricia	Ángeles Universidad
ANGEL	MARISOL RIVERA HERNANDEZ	GINECO OBSTETRICIA	TLACOTALPAN 59 ROMA SUR
TALINA	Marlene de la Peña Gutierrez	Ginecología	Hospital Ángeles Acoxpa
LUIS	Marlene Lizbeth Zamora Ramirez	Ginecología y Obstetricia	Ángeles Universidad
LUIS	Martha Espinoza Esparza	Ginecología y Obstetricia	San Ángel Inn Universidad
LUIS	Martha Leticia Zancatl Diaz	Ginecología y Obstetricia	HMG
TALINA	Martha Lilia Rodríguez García	Ginecología y Obstetricia	Hospital Ángeles Acoxpa
TALINA	Martha Olivia Gómez Alvarado	Urología	Hosp. Ángeles del Pedregal
ANGEL	MARTHA SUSANA MACIAS GALVAN	GINECOLOGÍA Y OBSTETRICIA	AV CHAPULTEPEC
TALINA	MARTIN TELICH VIDAL	UROLOGÍA / BAJA	CAMINO STA TERESA
ORALIA	Jorge Siller Nieto	Ginecologia	Circuitos Centro Comercial 20, Tlalnepantla
TALINA	Mauricio Cantellano Orozco	Urología	Hospital Ángeles Acoxpa
ORALIA	MAURICIO MANCILLA CASTELAN	GINECOLOGÍA Y OBSTETRICIA	CTO JURISTAS
ANGEL	MAURICIO MARX ORTA	GINECO OBSTETRICIA	TORRE QUERETARO
TALINA	Mauricio Osorio Caballero	Reproducción / Ginecología	Hosp. Ángeles del Pedregal
TALINA	Mercedes del Pilar Álvarez Goris	Ginecología y Obstetricia	Hosp. Ángeles del Pedregal
ORALIA	Mervin Omar Bolivar Cuencas	Ginecologia	Sor Juan Ines de la Cruz 280, Tlalnepantla
ORALIA	MIGUE ANGEL ZAPATA VILLALBA	UROLOGÍA	AV SOR JUANA INES DE LA CRUZ
TALINA	Miguel Ángel López Valle	Ginecología y Obstetricia	Hosp. Ángeles del Pedregal
LUIS	Miguel Angel Maldonado	Ginecología y Obstetricia	Consultorio privado
ANGEL	MIGUEL ANGEL ROBLES CARMONA	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
LUIS	Miguel Ángel Ulloa	Ginecología y Obstetricia	San Ángel Inn Universidad
ANGEL	MIGUEL ANGEL WALTER TORDECILLAS	GINECO OBSTETRICIA	TLACOTALPAN 59 ROMA SUR
LUIS	MIGUEL CASTAÑEDA HECTOR	UROLOGÍA	AV CHAPULTEPEC
ANGEL	MIGUEL CORRES MOLINA	GINECO OBSTETRICIA	FRONTERA 74 ROMA NORTE
LUIS	Miguel Corres Molina	Ginecología y Obstetricia	Ángeles Universidad
TALINA	Milagros Clementina Pérez Quintanilla	Ginecología y Obstetricia	Carlos Graef Fernandez 154 -342 (Tlaxala Santa Fe- Consultorio 342), Cuajimalpa de Morelos
ORALIA	Mireya Ovando Tapia	Ginecologia	Circuitos Centro Comercial 20, Tlalnepantla
LUIS	Miriam Azenet Carvajal Gonzalez	Ginecología y Obstetricia	San Angel Inn Acora
ANGEL	JUAN JIMENEZ HUERTA	GINECO OBSTETRICIA	TORRE DURANGO VIS 50
ANGEL	JUAN LUIS ABOITES	GINECO OBSTETRICIA	TEHUANTEPEC 251
ORALIA	Monica Mejia Vargas	Ginecologia	Circuitos Centro Comercial 20, Tlalnepantla
LUIS	Mónica Patrón Mondragón	Ginecologia y Obstetricia	MAC La Viga
LUIS	Mónica Rodríguez León	Ginecología y Obstetricia	San Ángel Inn Universidad
LUIS	Montserrat Ariadna Del Castillo Rodriguez	Ginecología y Obstetricia	Ángeles Universidad
ORALIA	Montserrat Cuevas	Ginecologia	Av. Dr. Gustavo Baz 309-TR A1
ORALIA	MYRNA FLORES MERCADO	GINECOLOGÍA Y OBSTETRICIA	CASMA
ORALIA	Nancy Roman Estrada	Gineco _Obstetricia	Rio Bamba 639, Lindavista
TALINA	Narciso Hernández Toriz	Urología / JEFE ONCO S XXI	Hosp. Ángeles del Pedregal
ORALIA	Navarrete Horta Teresa	Ginecología y obstetricia	Rio Bmaba 639. Lindavista
LUIS	Nayeli Cordoba Jimenez		San Ángel Inn Universidad
ORALIA	Nayeli Martinez Jaime	Gineco _Obstetricia	Calle Matanzas 715, Lindavista
ORALIA	Nelly Cortina	Ginecologia	Rio Bamba 639, Lindavista
ANGEL	NESI PEDRAZA	GINECO OBSTETRICIA	TEHUANTEPEC 251
ANGEL	NICOLAS SALVA PASTER	GINECO OBSTETRICIA	FRONTERA 74 ROMA NORTE
LUIS	Noemi Raquel Guerrero Patiño	Biología de Reproducción	San Angel Inn Acora
ORALIA	Norma Angélica Hernández Pineda	Ginecología y Obstetricia	Rio Bmaba 639. Lindavista
TALINA	Norma Lilia Ramírez Velázquez	Ginecología y Obstetricia	Hospital Ángeles Acoxpa
ANGEL	NORMA PATRICIA TREJO	GINECO OBSTETRICIA	TORRE TUXPAN 54
ANGEL	OCTAVIO CEDILLO LEY	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
ORALIA	Oliver Paul Cruz Orozco	Ginecologia	Circuitos Centro Comercial 20, Tlalnepantla
TALINA	Olivia Natividad López Adame	Ginecología y Obstetricia	Hospital Ángeles Acoxpa
ANGEL	OLIVIA PEÑA BALLESTEROS	GINECO OBSTETRICIA	TORRE DURANGO 290
ANGEL	OLIVIA SALAS	GINECO OBSTETRICIA	TORRE TUXPAN 6
ANGEL	OMAR DIMAS VICTORIO VARGAS	UROLOGÍA	MARCOS CARRILLO
ORALIA	Oscar Mejia Mendoza	Ginecologia	Av. Dr. Gustavo Baz 309-TR A1
ORALIA	Oscar Moncada Navarro	Ginecologia	Circuito Misioneros 5, Ciudad Satelite
ORALIA	Oscar Ruben Guinto Martiarena	Ginecologia	Av. montevideo 303, Lindavista
ORALIA	Oscar Salvador Sánchez Vazquez	Ginecologia	Rio Bamba 639, Lindavista
LUIS	Pablo Mariano González Aldeco	Ginecología y Obstetricia	San Ángel Inn Universidad
TALINA	Paloma de la Torre y Fernández	Ginecología y Obstetricia	Hosp. Ángeles del Pedregal
ORALIA	Paola Alejandra Vazquez Garcia	Ginecologia	Sor Juan Ines de la Cruz 280, Tlalnepantla
TALINA	Paola Delfina Rodríguez Estrada	Urología	Hosp. Ángeles del Pedregal
LUIS	Patricia del Carmen Franco Castañeda	Ginecología y Obstetricia	Consultorio privado
LUIS	PATRICIA ORIELLE PONCE LICERA 	GINECOLOGÍA Y OBSTETRICIA	MONTECITO
ANGEL	PATRICIA PEREZ BAILON	GINECO OBSTETRICIA	TLACOTALPAN 59 ROMA SUR
ANGEL	PATRICIA PEREZ BAILON	GINECOLOGÍA Y OBSTETRICIA	TLACOTALPAN
TALINA	Patricio Cruz García Villa	Urología	Hosp. Ángeles del Pedregal
ANGEL	PAULET RENNE FLORES ZARATE	GINECO OBSTETRICIA	TLACOTALPAN 59 ROMA SUR
LUIS	Paulett Bayona Soriano	Ginecología y Obstetricia	San Ángel Inn Universidad
LUIS	Paulina Carpio Barcenas	Ginecología y Obstetricia	San Angel Inn Acora
LUIS	Paulina Gonzalez Peña	Ginecología y Obstetricia	Ángeles Universidad
ANGEL	PAULINA JANCOR	GINECO OBSTETRICIA	TEHUANTEPEC 251
ORALIA	Paulina Treviño	Ginecologia	Ejercito Nacional 613, Polanco
ORALIA	Paulina Treviño Villareal	Ginecologia	Circuitos Centro Comercial 20, Tlalnepantla
ANGEL	LAURA VANESSA RODRIGUEZ ROCHA	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
TALINA	Manuel Alonso Villegas Martínez	Ginecología Oncológica, Ginecología y Obstetricia	Hospital Ángeles Acoxpa
ANGEL	PERLA DENISSE AGUILAR	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
TALINA	Priscilla Roque Gutiérrez	Biología de Reproducción, Ginecología y Obstetricia	Hospital Ángeles Acoxpa
ANGEL	RACHEL FIRSMAN AMORA	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
ANGEL	RAFAEL ALBERTO GARCIA GUDIÑO	GINECO OBSTETRICIA	TEPIC 117
TALINA	Ramiro Ordaz Vega	Ginecología y Obstetricia, Perinatal, Colposcopía, Biología de la Reproducción	Hospital Ángeles Acoxpa
ANGEL	RAMON CELAYA BARRERA	GINECO OBSTETRICIA	TORRE DURANGO 290
ANGEL	RAMON SALGADO MEDINA	UROLOGÍA / NO VISITAR TIENE CLINICA.	TLACOTALPAN
ANGEL	RANFERI GAONA ARREOLA	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
TALINA	Raul Alonso Martinez Ayala	Ginecología y Obstetricia	Hospital MAC Cuemanco
ORALIA	Raul Antonio Leon Ochoa	Ginecologia	Rio Bamba 639, Lindavista
ORALIA	Raul Barrientos Mendoza	Ginecologia	Sor Juan Ines de la Cruz 280, Tlalnepantla
ORALIA	Raul Padilla Rodas	Ginecologia	Av. Dr. Gustavo Baz 309-TR A1
ORALIA	RAUL PADILLA RODAS	GINECOLOGÍA Y OBSTETRICIA	AV GUSTAVO BAZ PRADA
LUIS	RAYMUNDO BERNAL GARCIA	UROLOGÍA	AV UNIVERSIDAD
LUIS	RAYMUNDO BERNAL GARCIA	UROLOGÍA	AV ARBOL DEL FUEGO
LUIS	Monica Alejandra Matta Martinez	Ginecología y Obstetricia	Ángeles Universidad
TALINA	Raymundo Canales de la Fuente	Ginecología y Obstetricia	Hosp. Ángeles del Pedregal
LUIS	Renata Madrid Zavala	Biología de Reproducción	San Angel Inn Acora
LUIS	Renata Melina Madrid Zavala	Ginecología y Obstetricia	Ángeles Universidad
ORALIA	Rene Hernandez Sanchez	Ginecologia	Circuitos Centro Comercial 20, Tlalnepantla
LUIS	Reyna Erika Franco Laguna	Ginecología y Obstetricia	San Angel Inn Acora
TALINA	Perla Angelica Silva Palma	Ginecología y Obstetricia	Hospital MAC Cuemanco
LUIS	Reyna Laura Lopez Sanchez	Ginecología y Obstetricia	Ángeles Universidad
ORALIA	Reyna Mariel Maclu Zorrero	Ginecologia	Circuito Misioneros 5, Ciudad Satelite
TALINA	Ricardo Adame Pinacho	Ginecología y Obstetricia	HOSPITAL ANGELES PEDREGAL Camino a Sta. Teresa 1055-S Torre Angeles Piso 7 Consultorio 730,
TALINA	Ricardo Almeida Magaña	Urología	Hosp. Ángeles del Pedregal
LUIS	Ricardo Alvarado Ballinas	Ginecologia y Obstetricia	MAC La Viga
ANGEL	RICARDO CAREAGA BENITEZ	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
ANGEL	RICARDO JAUREGUI TEJEDA	GINECO OBSTETRICIA	FRONTERA 74 ROMA NORTE
ORALIA	Rivero Corona Juan	Ginecología y obstetricia	Rio Bmaba 639. Lindavista
TALINA	Roberto Alejandro Carlos Romero y Lomas	Ginecología y Obstetricia	Hospital Ángeles Acoxpa
TALINA	ROBERTO ALEJANDRO CARLOS ROMERO Y LOMAS	GINECOLOGÍA Y OBSTETRICIA	CALZ ACOXPA
ANGEL	ROBERTO CARLOS MANRIQUEZ ANGULO	GINECOLOGÍA Y OBSTETRICIA	AV CHAPULTEPEC
LUIS	Roberto Carmona Librado	Ginecologia y Obstetricia	MAC La Viga
ANGEL	ROBERTO CISNEROS CHAVEZ	GINECO OBSTETRICIA	TLACOTALPAN 59 ROMA SUR
ORALIA	Roberto Martinez Alvares	Ginecologia	Circuito Misioneros 5, Ciudad Satelite
ANGEL	ROCIO GUERRA ARIAS	GINECO OBSTETRICIA	TORRE TUXPAN 10
LUIS	Rocio Velasquez Falconi	Ginecología y Obstetricia	San Angel Inn Acora
LUIS	Rodolfo Leonel Vargas Ruiz	Ginecología y Obstetricia	Ángeles Universidad
ANGEL	RODRIGO EMILIO RUIZ BARRIOS	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
LUIS	Rodrigo Emilio Ruz Barros	Ginecología y Obstetricia	Ángeles Universidad
TALINA	Rodrigo León Mar	Urología / DARLE SEGUIMIENTO	Hosp. Ángeles del Pedregal
TALINA	RODRIGO PEREZ BECERRA	UROLOGÍA	CALZ ACOXPA
TALINA	Rodrigo Pérez Becerra	Urología	Hospital Ángeles Acoxpa
ANGEL	RODRIGO SILVA	GINECO ONCOLOGO	QUERETARO 156, ROMA NORTE
TALINA	Romina Elizabeth Schafer Vega	Ginecología y Obstetricia	Hospital Angeles Lomas Vialidad de la Barranca, sn, Valle de las Palmas, Valle De Las Palmas, Huixquilucan
LUIS	Rosa Elba Mendoza Morales	Ginecología y Obstetricia	Ángeles Universidad
ORALIA	Rosa Elena Cano Nava	Ginecologia	Av. Dr. Gustavo Baz 309-TR A1
ANGEL	ROSA ESTELA RODRIGUEZ	GINECO OBSTETRICIA	FRONTERA 74 ROMA NORTE
ANGEL	ROSA MARIA	GINECO OBSTETRICIA	MANZANILLO 102
ANGEL	ROSA MARIA ARCE	GINECO OBSTETRICIA	TORRE DURANGO VIS 50
ANGEL	ROSA MARIA CHI RODRIGUEZ	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
ORALIA	Rosa Maria Sanchez	Gineco _Obstetricia	Homero 527, tercer piso
ORALIA	Rosa Maria Tufiño Loza	Ginecologia	Av. montevideo 303, Lindavista
LUIS	Rosa Virginia Sandoval Pirela	Ginecología y Obstetricia	Ángeles Universidad
LUIS	Rosalia García Ruiz	Ginecología y Obstetricia	HMG
ANGEL	ROSSANA ARGENTINA VIDAL RAMIREZ	GINECO OBSTETRICIA	QUERETARO 156, ROMA NORTE
ORALIA	Rossana Argentina Vidal Ramirez	Gineco _Obstetricia	Rio Bamba 639, Lindavista
ANGEL	RUBEN SAURER RAMIREZ	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
ORALIA	Ruth Camargo Lavaverde	Ginecologia	Circuitos Centro Comercial 20, Tlalnepantla
ANGEL	SALAVADOR DANIEL	GINECO OBSTETRICIA	TORRE TEPIC 113
ANGEL	SALVADOR DANIEL CARAPIA	GINECO OBSTETRICIA	TEPIC 118
LUIS	Salvador Gaviño Ambriz	Ginecología y Obstetricia	San Ángel Inn Universidad
ANGEL	SANCHEZ	GINECO OBSTETRICIA	COZUMEL 62 ROMA NORTE
ANGEL	SANDRA ADRIANA VERA VAZQUEZ	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
ORALIA	Sandra Flores Lozada	Ginecologia	Av. montevideo 303, Lindavista
ORALIA	Sandra Gabriela Rule Gomez	Ginecologia	Circuito Misioneros 5, Ciudad Satelite
TALINA	Sandra Guadalupe Girón Vargas	Ginecología y Obstetricia	Hospital Ángeles Acoxpa
LUIS	Sandra Iveth Ramírez Pastrana	Ginecología y Obstetricia	Centro de Especialidades Mixcoac
ANGEL	SANDRA URIBE FLORES	GINECO OBSTETRICIA	TEPIC 113
ANGEL	SANDRA URIBE FLORES	GINECO OBSTETRICIA	TORRE TEPIC 113
LUIS	Sandra Vera	Ginecología y Obstetricia	San Ángel Inn Universidad
TALINA	SanJuan Padrón Lucio	Urología	Hospital Ángeles Acoxpa
ANGEL	SANTIAGO ISLAS ESCOTO	GINECO OBSTETRICIA	TLACOTALPAN 59 ROMA SUR
ORALIA	Santos Regino Uscanga Sanchez	Ginecologia	Circuito Misioneros 5, Ciudad Satelite
LUIS	Sara Calvillo	Biología de Reproducción	Consultorio privado
LUIS	Saul Guzman Laguna	Ginecología y Obstetricia	HMG
TALINA	Sergio Durán Ortiz	Urología	Hospital Ángeles Acoxpa
TALINA	Sergio Durán Ortiz	Urología /YA TRABAJA CON NOSOTROS	Hospital MAC Periférico Sur
ANGEL	SERGIO ISRRAEL GARCIA NAVARRO	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
ANGEL	SERGIO MARTIN VELASCO ALVA	GINECO OBSTETRICIA	COZUMEL 62 ROMA NORTE
ORALIA	Sergio Pedraza	Ginecologia	Ejercito Nacional 613, Polanco
ANGEL	SILVIA ESCALERA	GINECO OBSTETRICIA	TEHUANTEPEC 251
ANGEL	SONIA REYNOSO RAMIREZ	GINECO OBSTETRICIA	FRONTERA 74 ROMA NORTE
LUIS	Stephanie Galicia Lopez	Ginecología y Obstetricia	HMG
LUIS	Susana Haquet	Ginecología y Obstetricia	San Ángel Inn Universidad
TALINA	Sylvain Collura Merlier	Urología	Hosp. Ángeles del Pedregal
ANGEL	TALINA RAMIREZ CARO	GINECO ONCOLOGICA	TEPIC 139
ORALIA	Tania Pina	Gineco _Obstetricia	Calles Casma #690, Lindavista
LUIS	Teresa Martínez Guerrero	Ginecología y Obstetricia	San Angel Inn Acora
ORALIA	Teresa MIchel Morales Montiel	Ginecologia	Sor Juan Ines de la Cruz 280, Tlalnepantla
ANGEL	TERESA NAVARRETE HORTA	GINECO OBSTETRICIA	TEHUANTEPEC 251
ORALIA	Teresa Rojas Sanchez	Ginecologia	Rio Bamba 639, Lindavista
LUIS	Valeria Ventura Quintana	Ginecología y Obstetricia	San Angel Inn Acora
ANGEL	VENANCIA VAZQUEZ NOLASCO	GINECO OBSTETRICIA	TLACOTALPAN 59 ROMA SUR
LUIS	Verónica Del Moral Estrada	Ginecología y Obstetricia	San Ángel Inn Universidad
LUIS	Verónica Diez Martínez Tara	Ginecologia y Obstetricia	MAC La Viga
ANGEL	VERONICA LARA VACA	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
LUIS	Verónica Martínez Ramírez	Ginecología y Obstetricia	HMG
ANGEL	VERONICA MUÑOZ	GINECO OBSTETRICIA	QUERETARO 156, ROMA NORTE
ANGEL	VICENTE RODRIGUEZ	GINECO OBSTETRICIA	TORRE TUXPAN 45 A
ANGEL	VICTOR HUGO CARMONA ORNELAS	GINECO OBSTETRICIA	TLACOTALPAN 59 ROMA SUR
ORALIA	Víctor Hugo Ortega Pérez 	Ginecología y Obstetricia	Rio Bmaba 639. Lindavista
TALINA	Víctor Israel Victoria Mejía	Urología	Hosp. Ángeles del Pedregal
TALINA	Víctor Manuel García González	Urología / TIENE UNA EMPRESA	Hospital Ángeles Acoxpa
ANGEL	VICTOR MANUEL TOPELE CARMONA	GINECO OBSTETRICIA	CDA. AGRARISMO 208 ESCANDON MIGUEL H.
TALINA	VICTOR SEVERO HERNANDEZ VALDES	UROLOGÍA / NO VISITAR 	CAMINO A SANTA TERESA
ORALIA	Violeta Fabiola Machuca Hernandez	Ginecologia	Sor Juan Ines de la Cruz 280, Tlalnepantla
ANGEL	VIRGINIA CORTES URIBE	GINECO OBSTETRICIA	TLACOTALPAN 59 ROMA SUR
LUIS	VIRGINIA ESPINOSA DELGADO	GINECOLOGÍA Y OBSTETRICIA	INSURGENTES SUR
TALINA	Vitelio Ruiz Bock	Ginecología y Obstetricia	Hospital MAC Periférico Sur
LUIS	WALDEMAR ALEJANDRO SOLIS LORIA	GINECOLOGÍA Y OBSTETRICIA	AV CHAPULTEPEC
ANGEL	XOCHIQUETZAL SANDRA CRUZ	UROLOGÍA	MARCOS CARRILLO
ANGEL	YAMIL ERNESTO OJEDA MORALES	GINECO OBSTETRICIA	TORRE DURANGO 64
LUIS	Yamile Torres Jasso	Ginecología y Obstetricia	HMG
LUIS	Yasiu Bustamante Quan	Ginecología y Obstetricia	Ángeles Universidad
TALINA	YASMIN MIRANDA AGUILAR	GINECOLOGÍA Y OBSTETRICIA	AV CANAL DE MIRAMONTES
LUIS	Yazmin Hernandez Balderas	Ginecología y Obstetricia	Ángeles Universidad
ORALIA	Yedid Medina Nava	Ginecologia	Circuitos Centro Comercial 20, Tlalnepantla
LUIS	Yeni Lovera	Ginecología y Obstetricia	Clínica Santa Margarita
LUIS	Yolanda Olivia Piña Maciel	Biología de Reproducción	San Angel Inn Acora
LUIS	Yolitsma Arlet Muciño Manjarrez	Ginecología y Obstetricia	HMG
LUIS	Yunuen Garcia Cortes	Ginecología y Obstetricia	San Angel Inn Acora
TALINA	Zaniru Raúl Marín Martínez	Ginecología Oncológica, Ginecología y Obstetricia	Hospital Ángeles Acoxpa
`;

export const parseData = (): Doctor[] => {
  const lines = RAW_DATA.trim().split('\n');
  const doctors: Doctor[] = [];

  // Parse Raw Medico Data
  lines.forEach((line, index) => {
    let parts = line.split('\t');
    if (parts.length < 3) {
        parts = line.split(/ {2,}/);
    }

    if (parts.length >= 2) {
      const executive = (parts[0]?.trim() || 'SIN ASIGNAR').toUpperCase();
      let name = (parts[1]?.trim() || 'DESCONOCIDO').toUpperCase();
      const specialty = (parts[2]?.trim() || 'MEDICINA GENERAL').toUpperCase();
      const address = (parts[3]?.trim() || '').toUpperCase();

      if (name) {
        const initialSchedule: ScheduleSlot[] = Array(7).fill(null).map(() => ({ day: 'Lunes', time: '', active: false }));

        doctors.push({
          id: `doc-${index}`,
          category: 'MEDICO',
          executive,
          name,
          specialty,
          address,
          visits: [],
          isInsuranceDoctor: false, 
          schedule: initialSchedule
        });
      }
    }
  });

  // Additional Hospitals Data
  const hospitalsToAdd = [
      // ANGEL
      { executive: 'ANGEL', name: 'HOSPITAL DALINDE' },
      { executive: 'ANGEL', name: 'HOSPITAL METROPOLITANO' },
      { executive: 'ANGEL', name: 'ANGELES ROMA' },
      { executive: 'ANGEL', name: 'ANGELES CLINICA LONDRES' },
      { executive: 'ANGEL', name: 'STAR MEDICA CENTRO' },
      { executive: 'ANGEL', name: 'HOSPITAL MARIA JOSE ROMA' },
      { executive: 'ANGEL', name: 'HOSPITAL MÉXICO' },
      { executive: 'ANGEL', name: 'HOSPITAL MOCEL' },
      // LUIS
      { executive: 'LUIS', name: 'ANGELES UNIVERSIDAD', address: 'Av. Universidad 1080, Xoco, Benito Juárez, 03330 Ciudad de México, CDMX', phone: '55 7256 9800' },
      { executive: 'LUIS', name: 'SAN ANGEL INN UNIVERSIDAD' },
      { executive: 'LUIS', name: 'SAN ANGEL INN HMG' },
      { executive: 'LUIS', name: 'SAN ANGEL INN ACORA' },
      { executive: 'LUIS', name: 'SAN ANGEL INN CHAPULTEPEC' },
      { executive: 'LUIS', name: 'SAN ANGEL INN PATRIOTISMO' },
      { executive: 'LUIS', name: 'SAN ANGEL INN DEL VALLE' },
      // ORALIA
      { executive: 'ORALIA', name: 'ANGELES SANTA MONICA' },
      { executive: 'ORALIA', name: 'STAR MÉDICA TLALNEPANTLA' },
      { executive: 'ORALIA', name: 'STAR MÉDICA LOMAS VERDES' },
      { executive: 'ORALIA', name: 'SAI SATELITE' },
      { executive: 'ORALIA', name: 'CORPORATIVO SATELITE' },
      { executive: 'ORALIA', name: 'MAC LOMAS VERDES' },
      { executive: 'ORALIA', name: 'MAC TLALNEPANTLA' },
      { executive: 'ORALIA', name: 'ANGELES LINDAVISTA' },
      // TALINA
      { executive: 'TALINA', name: 'ANGELES PEDREGAL' },
      { executive: 'TALINA', name: 'STAR MEDICA PEDREGAL' },
      { executive: 'TALINA', name: 'MEDICA SUR' },
      { executive: 'TALINA', name: 'ANGELES ACOXPA' },
      { executive: 'TALINA', name: 'MAC CUEMANCO' },
      { executive: 'TALINA', name: 'MAC PEDREGAL' },
      { executive: 'TALINA', name: 'MAC SANTA FE' },
      { executive: 'TALINA', name: 'STAR MÉDICA SANTA FE' },
  ];

  // Process Hospitals
  hospitalsToAdd.forEach((hosp: any, idx) => {
      const initialSchedule: ScheduleSlot[] = Array(7).fill(null).map(() => ({ day: 'Lunes', time: '', active: false }));
      
      doctors.push({
          id: `hosp-${idx}-${Date.now()}`,
          category: 'HOSPITAL',
          executive: hosp.executive,
          name: hosp.name,
          specialty: 'HOSPITAL',
          address: hosp.address || '',
          phone: hosp.phone || '',
          visits: [],
          isInsuranceDoctor: false,
          schedule: initialSchedule
      });
  });

  return doctors;
};