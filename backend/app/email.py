from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from fastapi import HTTPException
from fastapi.concurrency import run_in_threadpool

async def send_email(to_email: str, subject: str, html_content: str):
    """
    Envía un correo electrónico de forma asíncrona utilizando la API de SendGrid.
    """
    sendgrid_api_key = "SENDGRID_API_KEY" # Reemplazar con la clave real de SendGrid
    from_email = "mdarioc1998@gmail.com"
    
    if not sendgrid_api_key or not from_email:
        raise HTTPException(status_code=500, detail="La configuración de SendGrid no está completa.")

    message = Mail(
        from_email=from_email,
        to_emails=to_email,
        subject=subject,
        html_content=html_content
    )
    try:
        sg = SendGridAPIClient(sendgrid_api_key)
        # Ejecuta la llamada síncrona en un hilo separado para no bloquear el bucle de eventos
        response = await run_in_threadpool(sg.send, message)
        return response
    except Exception as e:
        # Captura y muestra el error real de la API de SendGrid para una depuración efectiva.
        # El error real suele estar en el cuerpo (body) de la excepción.
        error_body = str(e) # Usamos str(e) como fallback
        if hasattr(e, 'body'):
            error_body = e.body
        print(f"Error al enviar correo a {to_email} via SendGrid: {error_body}")
        raise HTTPException(status_code=500, detail=f"Error interno al intentar enviar el correo.")

"""
# using SendGrid's Python Library
# https://github.com/sendgrid/sendgrid-python
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

message = Mail(
    from_email='from_email@example.com',
    to_emails='to@example.com',
    subject='Sending with Twilio SendGrid is Fun',
    html_content='<strong>and easy to do anywhere, even with Python</strong>')
try:
    sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
    # sg.set_sendgrid_data_residency("eu")
    # uncomment the above line if you are sending mail using a regional EU subuser
    response = sg.send(message)
    print(response.status_code)
    print(response.body)
    print(response.headers)
except Exception as e:
    print(e.message)
"""