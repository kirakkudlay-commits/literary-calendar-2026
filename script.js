/* eslint-disable */

const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII']

// ---------- Build author slides from window.AUTHORS ----------
const deck = document.getElementById('deck')

window.AUTHORS.forEach((a, idx) => {
  const slide = document.createElement('section')
  slide.className = 'slide slide--author'
  slide.dataset.month = a.monthSlug

  // Split name on whitespace to put initials on first line, surname italic on second
  const parts = a.name.split(' ')
  const initials = parts.slice(0, parts.length - 1).join(' ')
  const surname = parts[parts.length - 1]

  slide.innerHTML = `
    <div class="slide__top">
      <div class="slide__month">${a.month} · ${ROMAN[idx]}</div>
      <div class="slide__counter"><b>${String(idx + 2).padStart(2, '0')}</b> / 13</div>
    </div>

    <div class="slide__body">
      <div class="portrait" data-caption="${a.fullName}">
        ${a.photo.endsWith('.svg')
          ? `<object type="image/svg+xml" data="${a.photo}" aria-label="${a.fullName}"></object>`
          : `<img src="${a.photo}" alt="${a.fullName}" loading="lazy">`}
      </div>

      <div class="author">
        <h2 class="author__name">${initials} <em>${surname}</em></h2>
        <div class="author__years">${a.years}</div>

        <div class="author__grid">
          <div class="author__block">
            <div class="author__label">Народження</div>
            <div class="author__value">${a.birth}</div>
          </div>
          <div class="author__block">
            <div class="author__label">Напрямок</div>
            <div class="author__value">${a.movement}</div>
          </div>

          <div class="author__block author__block--full">
            <div class="author__label">Найвідоміші твори</div>
            <ul class="author__list">
              ${a.works.map(w => `<li>${w}</li>`).join('')}
            </ul>
          </div>

          <div class="author__block author__block--full">
            <div class="author__label">Ознаки творчості</div>
            <ul class="author__list">
              ${a.traits.map(t => `<li>${t}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="slide__bottom">
      <div class="slide__quote">${a.quote}</div>
    </div>
  `
  deck.appendChild(slide)
})

// ---------- Slide navigation ----------
const slides = document.querySelectorAll('.slide')
const total = slides.length
const dotsEl = document.getElementById('dots')
const curEl = document.getElementById('cur')
const totEl = document.getElementById('tot')

totEl.textContent = String(total).padStart(2, '0')

// Build dot navigation
slides.forEach((_, i) => {
  const dot = document.createElement('li')
  dot.dataset.idx = i
  dot.title = i === 0 ? 'Cover' : `${window.AUTHORS[i - 1].name} (${window.AUTHORS[i - 1].month})`
  dot.addEventListener('click', () => goTo(i))
  dotsEl.appendChild(dot)
})

let current = 0

function goTo(i) {
  if (i < 0 || i >= total) return
  slides[current].classList.remove('active')
  dotsEl.children[current].classList.remove('active')
  current = i
  slides[current].classList.add('active')
  dotsEl.children[current].classList.add('active')
  curEl.textContent = String(current + 1).padStart(2, '0')
  // Sync browser's CSS variables with the slide's theme so navbar etc. don't fight it (optional)
  document.documentElement.dataset.month = slides[current].dataset.month
}

function next() { goTo(Math.min(current + 1, total - 1)) }
function prev() { goTo(Math.max(current - 1, 0)) }

document.getElementById('next').addEventListener('click', next)
document.getElementById('prev').addEventListener('click', prev)

document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowRight':
    case 'PageDown':
    case ' ':
      next(); e.preventDefault(); break
    case 'ArrowLeft':
    case 'PageUp':
      prev(); e.preventDefault(); break
    case 'Home': goTo(0); break
    case 'End':  goTo(total - 1); break
    case 'f':
    case 'F':
      toggleFullscreen(); break
    case 'p':
    case 'P':
      window.print(); break
  }
})

// Click anywhere on the slide (except links / buttons) to advance
deck.addEventListener('click', (e) => {
  if (e.target.closest('a, button, .navbar')) return
  next()
})

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
}
document.getElementById('fs').addEventListener('click', toggleFullscreen)

// ---------- Initial state ----------
slides[0].classList.add('active')
dotsEl.children[0].classList.add('active')
document.documentElement.dataset.month = 'cover'

// Restore index from URL hash if present (e.g. #5 jumps to slide 5)
function readHash() {
  const m = location.hash.match(/#(\d+)/)
  if (m) goTo(Math.max(0, Math.min(total - 1, parseInt(m[1], 10) - 1)))
}
readHash()
window.addEventListener('hashchange', readHash)
