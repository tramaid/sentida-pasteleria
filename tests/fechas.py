"""Una fecha futura para las pruebas: siempre 45 días después de hoy.

Así la suite no se vence: un borrador con fecha pasada se descarta y el
pedido no deja mandar una fecha que ya pasó. FUTURA_TEXTO es cómo la escribe
Sentida.fecha (p. ej. «sábado 7/11»).
"""
import datetime

DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
_dia = datetime.date.today() + datetime.timedelta(days=45)
FUTURA = _dia.isoformat()
FUTURA_TEXTO = f"{DIAS[_dia.weekday()]} {_dia.day}/{_dia.month}"
