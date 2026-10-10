import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Gem, Hammer, PenTool, Search } from 'lucide-react';
import { RING_TABLE, sizeForCircumference } from '../../lib/catalogue';

const STEPS = [
  { icon: Search, title: 'Sourcing', text: 'Stones and beads chosen by eye' },
  { icon: PenTool, title: 'Design', text: 'Sketched around your brief' },
  { icon: Hammer, title: 'Crafting', text: 'Shaped and finished by hand' },
  { icon: Gem, title: 'Setting', text: 'Each stone set with care' },
  { icon: Eye, title: 'Final reveal', text: 'Checked, boxed, sent to you' },
];

export default function Craft() {
  const [mm, setMm] = useState(54);
  const size = sizeForCircumference(mm);
  const [diameter, , us] = [RING_TABLE[size][0], RING_TABLE[size][1], RING_TABLE[size][2]];
  const pos = ((mm - 46) / (64 - 46)) * 100;

  return (
    <section id="craft" className="lx-section" aria-labelledby="craft-h">
      <div className="lx-wrap lx-craft-grid">
        <div className="lx-glass lx-sizer">
          <span className="lx-eyebrow" style={{ marginBottom: 0 }}>Find your perfect fit</span>
          <h3>Ring sizer</h3>
          <p className="lx-hint" style={{ margin: 0 }}>Wrap a strip of paper around the finger, mark where it meets, measure the length in millimetres, then slide to match.</p>
          <div className="lx-ruler" aria-hidden="true"><i style={{ left: `${Math.min(98, Math.max(0, pos))}%` }} /></div>
          <label className="lx-sr" htmlFor="sizer">Finger circumference in millimetres</label>
          <input id="sizer" className="lx-range" type="range" min={46} max={64} step={0.5} value={mm} onChange={(e) => setMm(Number(e.target.value))} aria-valuetext={`${mm} millimetres, UK size ${size}`} />
          <div className="lx-readout">
            <span>{mm.toFixed(1)} mm around<br />{diameter} mm across</span>
            <span style={{ textAlign: 'right' }}>UK size<br /><b>{size}</b> <span>· US {us}</span></span>
          </div>
          <Link to="/size-guide" className="lx-link" style={{ justifySelf: 'start' }}>Open the full size guide</Link>
        </div>

        <div>
          <span className="lx-eyebrow">How it is made</span>
          <h2 id="craft-h" className="lx-h2">The art of <em>true craftsmanship</em></h2>
          <p className="lx-lede">From the first stone to the final polish, every piece passes through the same five careful steps.</p>
          <ol className="lx-process" style={{ listStyle: 'none', padding: 0, margin: '30px 0 0' }}>
            {STEPS.map((s, i) => (
              <li key={s.title} className="lx-step">
                <span className="lx-step-ico"><s.icon size={28} strokeWidth={1.3} aria-hidden="true" /></span>
                <small>0{i + 1}</small>
                <h4>{s.title}</h4>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
