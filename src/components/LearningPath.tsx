import { GraduationCap } from "lucide-react";
import { lessons } from "../lib/lessons";

export function LearningPath() {
  return (
    <section className="panel" aria-labelledby="learning-title">
      <div className="panel-title">
        <GraduationCap size={18} />
        <h2 id="learning-title">成长课堂</h2>
      </div>
      <div className="lesson-grid">
        {lessons.map((lesson) => {
          const Icon = lesson.icon;
          return (
            <article className="lesson-card" key={lesson.title}>
              <div className="lesson-card__icon">
                <Icon size={20} />
              </div>
              <div>
                <div className="lesson-card__meta">
                  <span>{lesson.level}</span>
                  <span>{lesson.duration}</span>
                </div>
                <h3>{lesson.title}</h3>
                <p>{lesson.summary}</p>
                <div className="lesson-card__tags">
                  {lesson.checkpoints.map((checkpoint) => (
                    <span key={checkpoint}>{checkpoint}</span>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
