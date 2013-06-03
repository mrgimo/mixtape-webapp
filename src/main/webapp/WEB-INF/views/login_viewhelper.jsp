<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ page contentType="text/html; charset=UTF-8"%>

<div class="container-fluid login-view">

	<div class="error invisible">
		<p class="text-error">
			<c:choose>
				<c:when test="${not empty error}">
					Anmeldung fehlgeschlagen: <small>
						${sessionScope["SPRING_SECURITY_LAST_EXCEPTION"].message} </small>
				</c:when>
				<c:when test="${loginFailed}">
					Anmeldung fehlgeschlagen: <small> Benutzername/Passwort
						falsch.</small>
				</c:when>
				<c:when test="${authError || timeout}">
					Sitzung abgelaufen: <small> Eine erneute Anmeldung ist
						erforderlich.</small>
				</c:when>
				<c:otherwise>
					Anmeldung fehlgeschlagen: <small></small>
				</c:otherwise>
			</c:choose>
		</p>
	</div>

	<form name="f" action="<c:url value="j_spring_security_check" />"
		method="POST">

		<div class="row">
			<label class="span2" for="j_username">Benutzername:</label> <input
				class="span3" type="text" name="j_username" value="" />
		</div>

		<div class="row">
			<label class="span2" for="j_password">Passwort:</label> <input
				class="span3" type="password" name="j_password" />
		</div>

		<div
			class="login-submit text-center <c:if test="${not loginIncludeCancel}">row</c:if>">
			<c:if test="${loginIncludeCancel}">
				<input type="button" class="btn span2" id="loginCancel"
					data-dismiss="modal" value="Abbrechen" />
			</c:if>
			<input class="btn btn-primary span2" name="submit" type="submit"
				value="Anmelden" />
		</div>

	</form>

</div>