const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit'); // Agrega express-rate-limit para limitar las solicitudes

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar el límite de solicitudes por sesión
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 1, // Una solicitud por ventana de 5 minutos
  keyGenerator: (req) => req.ip, // Utiliza la Ip como clave para el límite
});

app.use('/send-email', limiter); // Aplica el límite solo a la ruta de envío de correos

app.post('/send-email', async (req, res) => {
  try {
    const { to, subject, text } = req.body;
    // Verificar el sessionId y el tiempo de la última solicitud
    // Aquí puedes implementar tu propia lógica para rastrear el tiempo de la última solicitud y el sessionId

    // Configurar el transporte de nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    // Enviar el correo electrónico
    await transporter.sendMail(mailOptions);

    // Enviar una respuesta al frontend
    res.status(200).json({ message: 'Correo enviado con éxito' });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    res.status(500).json({ message: 'Error al enviar el correo' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
