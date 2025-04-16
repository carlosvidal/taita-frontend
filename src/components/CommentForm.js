// Vanilla JS Comment Form Component
// Captura errores JS globales en este componente
window.addEventListener('error', function(e) {
  const el = document.querySelector('comment-form')?.shadowRoot?.getElementById('comment-message');
  if (el) {
    el.textContent = 'Error JS: ' + (e.error?.message || e.message);
    el.className = 'comment-message comment-error';
  }
  console.error('[CommentForm] Error JS global:', e.error || e);
});
// Usage: import and include <script type="module" src="/src/components/CommentForm.js"></script> in your Astro page

class CommentFormElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.apiBase = "";
    this.postId = "";
    this.numericPostId = null;
    this.otpValidated = false;
    this.userEmail = "";
    this.otp = "";
    this.loading = false;
    this.step = 1; // 1: email, 2: otp, 3: comentario
  }

  connectedCallback() {
    this.apiBase = this.getAttribute("api-base") || "http://localhost:3000/api";
    this.postId = this.getAttribute("post-id");
    this.render();
    this.resolveNumericPostId();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .comment-form { margin: 2rem 0; border: 1px solid #eee; padding: 1.5rem; border-radius: 8px; background: #fafbfc; }
        .comment-form label { display: block; margin-bottom: 0.3em; font-weight: 500; }
        .comment-form input, .comment-form textarea { width: 100%; margin-bottom: 1em; padding: 0.5em; border: 1px solid #ccc; border-radius: 4px; }
        .comment-form button { background: #007bff; color: #fff; border: none; padding: 0.6em 1.5em; border-radius: 4px; cursor: pointer; }
        .comment-form button[disabled] { background: #aaa; cursor: not-allowed; }
        .comment-message { margin: 0.7em 0; color: #007bff; font-weight: 500; }
        .comment-error { color: #d00; }
      </style>
      ${this.renderStep()}
    `;
    this.form = this.shadowRoot.querySelector("form");
    this.messageDiv = this.shadowRoot.getElementById("comment-message");
    // Refuerzo especial para OTP
    if (this.step === 2) {
      const otpDebug = this.shadowRoot.getElementById('otp-debug-message');
      if (otpDebug) {
        otpDebug.textContent = '[DEBUG] Render paso 2: listener submit conectado';
      }
    }
    if (this.form) {
      // Elimina listeners previos clonando el nodo
      const oldForm = this.form;
      const newForm = oldForm.cloneNode(true);
      oldForm.parentNode.replaceChild(newForm, oldForm);
      this.form = newForm;
      this.form.addEventListener("submit", function(e) {
        console.log('[DEBUG] Event listener submit, this.step =', this.step, 'this =', this);
        if (this.step === 2) {
          const otpDebug = this.shadowRoot.getElementById('otp-debug-message');
          if (otpDebug) {
            otpDebug.textContent = '[DEBUG] Submit OTP capturado';
          }
          console.log('[DEBUG] Submit OTP capturado');
        }
        if (this.step === 3) {
          console.log('[DEBUG] Submit comentario capturado');
        }
        this.handleSubmit(e);
      }.bind(this));
      if (this.step === 3) {
        console.log('[DEBUG] Listener submit conectado en paso 3');
      }
    }
    // Si no hay JWT y estamos en paso 3, muestra mensaje de error y oculta el formulario
    const jwt = this.jwt || localStorage.getItem('comment_jwt');
    if (!jwt && this.step === 3) {
      this.shadowRoot.innerHTML = `<div class="comment-error">Debes validar tu email para poder comentar.</div>`;
      return;
    }
  }

  renderStep() {
    console.log('[CommentForm] Renderizando paso', this.step);
    // Solo muestra el formulario de comentario si hay JWT válido
    const jwt = this.jwt || localStorage.getItem('comment_jwt');
    if (this.step === 3 && !jwt) {
      return `<div class="comment-error">Debes validar tu email para poder comentar.</div>`;
    }
    if (jwt && this.step !== 3) {
      // Si hay JWT pero no estamos en paso 3, permite avanzar
      this.step = 3;
    }
    switch (this.step) {
      case 1:
        return `
          <form class="comment-form">
            <label for="comment-email">Email (no se mostrará)</label>
            <input id="comment-email" type="email" required maxlength="100" />
            <button type="submit">Solicitar OTP</button>
            <div class="comment-message" id="comment-message"></div>
          </form>
        `;
      case 2:
        return `
          <form class="comment-form" id="otp-form">
            <label for="comment-otp">OTP</label>
            <input id="comment-otp" type="text" required maxlength="6" />
            <button type="submit" id="otp-submit-btn">Validar OTP</button>
            <div class="comment-message" id="comment-message"></div>
          </form>
          <div id="otp-debug-message" style="color:#d00;font-size:0.9em;"></div>
        `;
      case 3:
        // Prellenar el nombre si existe en localStorage
        const savedName = localStorage.getItem('comment_author_name') || '';
        return `
          <form class="comment-form">
            <label for="comment-name">Nombre</label>
            <input id="comment-name" type="text" required maxlength="40" value="${savedName.replace(/"/g, '&quot;')}" />
            <label for="comment-content">Comentario</label>
            <textarea id="comment-content" required maxlength="600"></textarea>
            <button type="submit">Enviar comentario</button>
            <div class="comment-message" id="comment-message"></div>
          </form>
        `;
      default:
        return "";
    }
  }

  showMessage(msg, error = false) {
    this.messageDiv.textContent = msg;
    this.messageDiv.className =
      "comment-message" + (error ? " comment-error" : "");
  }

  async handleSubmit(e) {
    e.preventDefault();
    if (this.loading) return;
    this.loading = true;
    let success = false;
    console.log('[CommentForm] handleSubmit paso', this.step, 'this =', this);
    if (typeof this.step !== 'number' || this.step < 1 || this.step > 3) {
      this.showMessage('[ERROR] Paso inválido: ' + this.step, true);
      console.error('[ERROR] Paso inválido en handleSubmit:', this.step, this);
      this.loading = false;
      return;
    }
    switch (this.step) {
      case 1:
        success = await this.handleEmailSubmit();
        break;
      case 2:
        success = await this.handleOtpSubmit();
        break;
      case 3:
        success = await this.handleCommentSubmit();
        break;
    }
    console.log('[CommentForm] handleSubmit resultado paso', this.step, ':', success);
    // Solo avanza si fue exitoso
    if (success && this.step < 3) {
      this.step++;
      this.render();
    }
    this.loading = false;
  }

  async handleEmailSubmit() {
    console.log('[CommentForm] handleEmailSubmit llamado');
    const email = this.shadowRoot.getElementById("comment-email").value.trim();
    if (!email) {
      this.showMessage("Completa el campo de email.", true);
      return false;
    }
    try {
      const res = await fetch(`${this.apiBase}/comments/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (!res.ok) {
        const text = await res.text();
        console.error('[CommentForm] Error solicitando OTP:', text);
        throw new Error("No se pudo solicitar el OTP.");
      }
      const data = await res.json();
      console.log('[CommentForm] Respuesta OTP:', data);
      this.userEmail = email;
      this.showMessage("Te enviamos un OTP (usa 123456 para pruebas)", false);
      return true;
    } catch (err) {
      this.showMessage(err.message || "Error al solicitar OTP", true);
      return false;
    }
  }

  async handleOtpSubmit() {
    console.log('[CommentForm] handleOtpSubmit llamado');
    const otp = this.shadowRoot.getElementById("comment-otp").value.trim();
    if (!otp) {
      this.showMessage("Completa el campo de OTP.", true);
      return false;
    }
    try {
      console.log('[CommentForm] Enviando OTP:', otp, 'para', this.userEmail);
      const res = await fetch(`${this.apiBase}/comments/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: this.userEmail, code: otp })
      });
      if (!res.ok) {
        const text = await res.text();
        console.error('[CommentForm] Error validando OTP:', text);
        this.showMessage("OTP incorrecto o expirado.", true);
        return false;
      }
      const data = await res.json();
      console.log('[CommentForm] Respuesta validación OTP:', data);
      if (data.token) {
        localStorage.setItem('comment_jwt', data.token);
        this.jwt = data.token;
        console.log('[CommentForm] JWT guardado:', data.token);
        this.otpValidated = true;
        this.showMessage("OTP validado. Ahora puedes comentar.", false);
        setTimeout(() => {
          this.step = 3;
          this.render();
        }, 1000);
      } else {
        this.showMessage("No se recibió token del backend. Intenta de nuevo.", true);
        this.otpValidated = false;
        this.jwt = null;
        localStorage.removeItem('comment_jwt');
        setTimeout(() => {
          this.step = 2;
          this.render();
        }, 1000);
        return false;
      }
    } catch (err) {
      this.showMessage("Error validando OTP.", true);
      this.otpValidated = false;
      this.jwt = null;
      localStorage.removeItem('comment_jwt');
      setTimeout(() => {
        this.step = 2;
        this.render();
      }, 1000);
      console.error('[CommentForm] Catch error validando OTP:', err);
    }
  }

  async handleCommentSubmit() {
    console.log('[CommentForm] handleCommentSubmit llamado');
    const name = this.shadowRoot.getElementById("comment-name").value.trim();
    const content = this.shadowRoot.getElementById("comment-content").value.trim();
    if (!name || !content) {
      this.showMessage("Completa todos los campos.", true);
      this.loading = false;
      console.warn('[CommentForm] Campos incompletos al enviar comentario');
      return;
    }
    try {
      const jwt = this.jwt || localStorage.getItem('comment_jwt');
      if (!jwt) {
        this.showMessage("Debes validar tu email antes de comentar.", true);
        this.loading = false;
        console.error('[CommentForm] JWT ausente, no se puede comentar');
        return;
      }
      if (!this.numericPostId) await this.resolveNumericPostId();
      console.log('[CommentForm] Enviando comentario:', {
        postId: this.numericPostId,
        authorName: name,
        content,
        jwt
      });
      const res = await fetch(`${this.apiBase}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}`
        },
        body: JSON.stringify({
          postId: this.numericPostId,
          authorName: name,
          content
        })
      });
      if (!res.ok) {
        const text = await res.text();
        console.error('[CommentForm] Error enviando comentario:', text);
        this.showMessage("No se pudo enviar el comentario. " + text, true);
        this.loading = false;
        return;
      }
      const data = await res.json();
      console.log('[CommentForm] Respuesta comentario:', data);
      this.showMessage("¡Comentario enviado! Será revisado antes de publicarse.", false);
      // Guarda el nombre del autor en localStorage
      localStorage.setItem('comment_author_name', name);
      // Deshabilita el botón de submit durante el mensaje de éxito
      const submitBtn = this.shadowRoot.querySelector("form button[type='submit']");
      if (submitBtn) submitBtn.disabled = true;
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      this.showMessage(err.message || "Error al enviar comentario", true);
      console.error('[CommentForm] Catch error enviando comentario:', err);
    } finally {
      this.loading = false;
    }
  }

  async resolveNumericPostId() {
    // Si ya es un número, úsalo directo
    if (/^\d+$/.test(this.postId)) {
      this.numericPostId = Number(this.postId);
      return;
    }
    // Si es UUID, fetch al endpoint
    try {
      const res = await fetch(`${this.apiBase}/posts/uuid/${this.postId}`);
      if (!res.ok) throw new Error("No se pudo obtener el post");
      const data = await res.json();
      this.numericPostId = data.id;
    } catch (err) {
      this.showMessage("No se pudo inicializar el formulario.", true);
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    if (this.loading) return;
    this.loading = true;
    switch (this.step) {
      case 1:
        this.handleEmailSubmit(e);
        break;
      case 2:
        this.handleOtpSubmit(e);
        break;
      case 3:
        this.handleCommentSubmit(e);
        break;
      default:
        break;
    }
  }

  async handleEmailSubmit(e) {
    const email = this.shadowRoot.getElementById("comment-email").value.trim();
    if (!email) {
      this.showMessage("Completa el campo de email.", true);
      this.loading = false;
      return;
    }
    try {
      const res = await fetch(`${this.apiBase}/comments/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("No se pudo solicitar el OTP.");
      this.userEmail = email;
      this.step = 2;
      this.render();
    } catch (err) {
      this.showMessage(err.message || "Error al solicitar OTP", true);
    } finally {
      this.loading = false;
    }
  }

}

customElements.define("comment-form", CommentFormElement);

export default CommentFormElement;

