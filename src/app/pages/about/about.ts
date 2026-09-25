import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [Navbar,Footer],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class About implements AfterViewInit, OnDestroy {

  private observer?: IntersectionObserver;

  ngAfterViewInit() {
    const counters = document.querySelectorAll<HTMLElement>('.counter');
    const statsSection = document.querySelector('.stats');

    const startCounter = () => {
      counters.forEach((counter) => {
        const target = Number(counter.dataset['target']);
        let count = 0;
        const increment = target / 100;

        const updateCounter = () => {
          count += increment;

          if (count < target) {
            counter.innerText = Math.floor(count).toString();
            requestAnimationFrame(updateCounter);
          } else {
            if (target === 50000) {
              counter.innerText = '50K+';
            } else if (target === 10000) {
              counter.innerText = '10K+';
            } else if (target === 49) {
              counter.innerText = '4.9★';
            } else {
              counter.innerText = target + '+';
            }
          }
        };

        updateCounter();
      });
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startCounter();
          this.observer?.disconnect();
        }
      });
    });

    if (statsSection) {
      this.observer.observe(statsSection);
    }
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}