package example.a;

public class Course {
    private String name;
    public Course(String name){ this.name = name; }
    public String getName(){ return name; }
}
package example.a;

public class Student {
    private final Course course;
    private final String name;

    public Student(String name, Course course){
        this.name = name;
        this.course = course;
    }

    public void introduce(){
        System.out.println("Hello, I'm " + name + " and I study " + course.getName());
    }
}
package example.a;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {
    @Bean
    public Course course() {
        return new Course("Computer Networks");
    }

    @Bean
    public Student student() {
        // Spring injects the Course bean when calling course()
        return new Student("Akshara", course());
    }
}

package example.a;

import org.springframework.context.annotation.AnnotationConfigApplicationContext;

public class MainApp {
    public static void main(String[] args) {
        try (AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext(AppConfig.class)) {
            Student s = ctx.getBean(Student.class);
            s.introduce(); // demonstrates DI
        }
    }
}
