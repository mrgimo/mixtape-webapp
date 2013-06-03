<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ page contentType="text/html; charset=UTF-8"%>
<!DOCTYPE html>
<html lang="de">
<head>

<title>mixTape</title>

<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

<link rel="stylesheet"
	href="<c:url value="/resources/css/jquery-ui-1.10.3.custom.min.css" />"
	media="screen" />
<link rel="stylesheet"
	href="<c:url value="/resources/css/bootstrap.min.css" />"
	media="screen" />
<link rel="stylesheet"
	href="<c:url value="/resources/css/mixtape-webapp.css" />"
	media="screen" />

</head>

<body>
	<div class="container-fluid">

		<%@ include file="/WEB-INF/views/navigation_viewhelper.jsp"%>

		<div class="container-fluid">

			<div class="span6 center">

				<h3>Anmeldung erforderlich</h3>

				<%@ include file="/WEB-INF/views/login_viewhelper.jsp"%>

			</div>

			<%@ include file="/WEB-INF/views/footer_viewhelper.jsp"%>

		</div>

		<div class="modal hide fade">
			<div class="modal-header">
				<h4></h4>
			</div>
			<div class="modal-body"></div>
			<div class="modal-footer">
				<button class="btn btn-primary">OK</button>
			</div>
		</div>

		<script src="<c:url value="/resources/js/jquery-1.9.1.js" />"></script>
		<script
			src="<c:url value="/resources/js/jquery-ui-1.10.3.custom.min.js" />"></script>
		<script
			src="<c:url value="/resources/js/jquery-ui.touch-punch.min.js" />"></script>
		<script src="<c:url value="/resources/js/bootstrap.min.js" />"></script>
		<script src="<c:url value="/resources/js/bootstrap-tooltip.js" />"></script>
		<script src="<c:url value="/resources/js/init.js" />" /></script>

	</div>

</body>
</html>
