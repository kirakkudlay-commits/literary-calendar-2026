/* eslint-disable */

const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII']

const MONTH_NUM = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
}

const WEEKDAYS = ['ПН','ВТ','СР','ЧТ','ПТ','СБ','НД']

// ---------- Build a month-of-2026 calendar grid ----------
function buildCalendarHTML(monthNum, birthDay) {
  const year = 2026
  const firstDay = new Date(year, monthNum - 1, 1)
  // JS getDay(): 0=Sun..6=Sat. We want Mon=0..Sun=6.
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, monthNum, 0).getDate()

  const cells = []
  for (let i = 0; i < startOffset; i++) cells.push('<span class="cal__cell cal__cell--empty"></span>')
  for (let d = 1; d <= daysInMonth; d++) {
    const isBirth = d === birthDay
    const isWeekend = ((startOffset + d - 1) % 7) >= 5  // Sat (5) or Sun (6)
    const cls = ['cal__cell', 'cal__day']
    if (isWeekend) cls.push('cal__day--weekend')
    if (isBirth) cls.push('cal__day--birth')
    cells.push(`<span class="${cls.join(' ')}">${d}${
      isBirth
        ? `<svg class="cal__circle" viewBox="-30 -25 60 50" aria-hidden="true">
             <ellipse cx="0" cy="-1" rx="22" ry="17" transform="rotate(-7)"
                      stroke="var(--cal-circle, #d62828)" stroke-width="2.6"
                      fill="none" stroke-linecap="round"/>
             <ellipse cx="1" cy="0" rx="20" ry="15.5" transform="rotate(-12)"
                      stroke="var(--cal-circle, #d62828)" stroke-width="1.6"
                      fill="none" stroke-linecap="round" opacity="0.65"/>
           </svg>`
        : ''
    }</span>`)
  }

  // Pad to a full 6×7 grid so spacing is consistent
  while (cells.length < 42) cells.push('<span class="cal__cell cal__cell--empty"></span>')

  return `
    <div class="calendar">
      <div class="cal__header">
        <span class="cal__year">2026</span>
        <span class="cal__month-name"></span>
      </div>
      <div class="cal__weekdays">
        ${WEEKDAYS.map((w, i) => `<span class="cal__weekday${i >= 5 ? ' cal__weekday--weekend' : ''}">${w}</span>`).join('')}
      </div>
      <div class="cal__grid">
        ${cells.join('')}
      </div>
    </div>`
}

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

  const monthNum = MONTH_NUM[a.monthSlug]
  const calendarHTML = buildCalendarHTML(monthNum, a.birthDay)

  slide.innerHTML = `
    <div class="slide__top">
      <div class="slide__month">${a.month} · ${ROMAN[idx]}</div>
      <div class="slide__counter"><b>${String(idx + 2).padStart(2, '0')}</b> / 13</div>
    </div>

    <div class="slide__body">
      <div class="slide__left">
        <div class="portrait" data-caption="${a.fullName}">
          ${a.photo.endsWith('.svg')
            ? `<object type="image/svg+xml" data="${a.photo}" aria-label="${a.fullName}"></object>`
            : `<img src="${a.photo}" alt="${a.fullName}" loading="lazy">`}
        </div>
        ${calendarHTML}
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

  // Set the month name inside the calendar header (we built it before knowing context)
  deck.appendChild(slide)
  slide.querySelector('.cal__month-name').textContent = a.month
})

// ---------- Slide navigation ----------
const slides = document.querySelectorAll('.slide')
const total = slides.length
const dotsEl = document.getElementById('dots')
const curEl = document.getElementById('cur')
const totEl = document.getElementById('tot')

totEl.textContent = String(total).padStart(2, '0')

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

slides[0].classList.add('active')
dotsEl.children[0].classList.add('active')
document.documentElement.dataset.month = 'cover'

function readHash() {
  const m = location.hash.match(/#(\d+)/)
  if (m) goTo(Math.max(0, Math.min(total - 1, parseInt(m[1], 10) - 1)))
}
readHash()
window.addEventListener('hashchange', readHash)
