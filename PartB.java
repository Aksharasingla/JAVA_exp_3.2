CREATE DATABASE school;
USE school;

CREATE TABLE student (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  age INT
);
<?xml version="1.0"?>
<!DOCTYPE hibernate-configuration PUBLIC
 "-//Hibernate/Hibernate Configuration DTD 3.0//EN"
 "http://hibernate.sourceforge.net/hibernate-configuration-3.0.dtd">
<hibernate-configuration>
  <session-factory>
    <property name="hibernate.connection.driver_class">com.mysql.cj.jdbc.Driver</property>
    <property name="hibernate.connection.url">jdbc:mysql://localhost:3306/school?useSSL=false&amp;serverTimezone=UTC</property>
    <property name="hibernate.connection.username">root</property>
    <property name="hibernate.connection.password">password</property>

    <property name="hibernate.dialect">org.hibernate.dialect.MySQL8Dialect</property>
    <property name="hibernate.hbm2ddl.auto">update</property> <!-- for dev -->
    <property name="show_sql">true</property>

    <mapping class="example.b.Student"/>
  </session-factory>
</hibernate-configuration>
package example.b;

import jakarta.persistence.*;

@Entity
@Table(name="student")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;
    private String email;
    private Integer age;

    public Student() {}
    public Student(String name, String email, Integer age){
        this.name = name; this.email = email; this.age = age;
    }
    // getters/setters
    public Integer getId(){ return id; }
    public String getName(){ return name; }
    public void setName(String name){ this.name = name; }
    public String getEmail(){ return email; }
    public void setEmail(String email){ this.email = email; }
    public Integer getAge(){ return age; }
    public void setAge(Integer age){ this.age = age; }
}
package example.b;

import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;

public class HibernateUtil {
    private static final SessionFactory SESSION_FACTORY = build();

    private static SessionFactory build() {
        try {
            return new Configuration().configure().buildSessionFactory();
        } catch (Throwable ex) {
            throw new ExceptionInInitializerError(ex);
        }
    }

    public static SessionFactory getSessionFactory(){ return SESSION_FACTORY; }
    public static void shutdown(){ getSessionFactory().close(); }
}package example.b;

import org.hibernate.Session;
import org.hibernate.Transaction;
import java.util.List;

public class StudentCRUD {
    public static Integer create(String name, String email, int age) {
        Transaction tx = null;
        Integer id;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            tx = session.beginTransaction();
            Student s = new Student(name, email, age);
            id = (Integer) session.save(s);
            tx.commit();
            return id;
        } catch (Exception e) {
            if (tx != null) tx.rollback();
            throw e;
        }
    }

    public static Student read(Integer id) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.get(Student.class, id);
        }
    }

    public static List<Student> readAll() {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.createQuery("from example.b.Student", Student.class).list();
        }
    }

    public static void update(Integer id, String newEmail) {
        Transaction tx = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            tx = session.beginTransaction();
            Student s = session.get(Student.class, id);
            if (s != null) {
                s.setEmail(newEmail);
                session.update(s);
            }
            tx.commit();
        } catch (Exception e) {
            if (tx != null) tx.rollback();
            throw e;
        }
    }

    public static void delete(Integer id) {
        Transaction tx = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            tx = session.beginTransaction();
            Student s = session.get(Student.class, id);
            if (s != null) session.delete(s);
            tx.commit();
        } catch (Exception e) {
            if (tx != null) tx.rollback();
            throw e;
        }
    }

    // Demo main
    public static void main(String[] args) {
        Integer id = create("Riya", "riya@example.com", 21);
        System.out.println("Inserted id: " + id);

        Student s = read(id);
        System.out.println("Read student: " + s.getName() + " / " + s.getEmail());

        update(id, "riya.new@example.com");
        System.out.println("Updated email.");

        readAll().forEach(st -> System.out.println(st.getId() + ": " + st.getName()));

        delete(id);
        System.out.println("Deleted student.");
        HibernateUtil.shutdown();
    }
}


