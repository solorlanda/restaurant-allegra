const filters = document.querySelectorAll('.filters button');
const dishes = document.querySelectorAll('[data-dish]');
const menuStatus = document.querySelector('#menu-status');

for (const button of filters) {
  button.addEventListener('click', () => {
    const category = button.dataset.category;
    let count = 0;
    for (const filter of filters) {
      filter.setAttribute('aria-pressed', String(filter === button));
    }
    for (const dish of dishes) {
      dish.hidden = category !== 'all' && category !== dish.dataset.dish;
      if (!dish.hidden) count += 1;
    }
    menuStatus.textContent = `${count} menu items shown.`;
  });
}

const form = document.querySelector('#booking-form');
const confirmation = document.querySelector('#confirmation');
const { date, time, guests, name: guestName } = form.elements;
const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Copenhagen',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

for (let minutes = 10 * 60; minutes <= 21 * 60; minutes += 30) {
  const label = `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`;
  time.add(new Option(label, label, false, label === '19:00'));
}

function updateAvailability() {
  const parts = Object.fromEntries(
    dateFormatter.formatToParts(new Date()).map(({ type, value }) => [type, value]),
  );
  date.min = `${parts.year}-${parts.month}-${parts.day}`;
  const now = `${parts.hour}:${parts.minute}`;
  for (const slot of time.options) {
    slot.disabled = date.value === date.min && slot.value <= now;
  }
  if (time.selectedOptions[0]?.disabled || time.selectedIndex < 0) {
    const nextSlot = Array.from(time.options).find((slot) => !slot.disabled);
    time.selectedIndex = nextSlot?.index ?? -1;
  }
  date.setCustomValidity(time.selectedIndex < 0 ? 'Choose a later date to see more times.' : '');
}

date.addEventListener('change', updateAvailability);
guestName.addEventListener('input', () => guestName.setCustomValidity(''));
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const selectedTime = time.value;
  updateAvailability();
  guestName.setCustomValidity(guestName.value.trim() ? '' : 'Enter a sample name.');
  if (!form.reportValidity()) return;
  if (selectedTime !== time.value) {
    time.focus();
    return;
  }

  const longDate = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeZone: 'UTC',
  }).format(new Date(`${date.value}T12:00:00Z`));
  const party = guests.selectedOptions[0].textContent.toLowerCase();
  document.querySelector('#summary').textContent =
    `${guestName.value.trim()} · ${longDate} at ${time.value} · ${party}`;
  form.hidden = true;
  confirmation.hidden = false;
  document.querySelector('#confirmation-title').focus();
});

document.querySelector('#edit').addEventListener('click', () => {
  confirmation.hidden = true;
  form.hidden = false;
  updateAvailability();
  date.focus();
});
updateAvailability();
form.hidden = false;
