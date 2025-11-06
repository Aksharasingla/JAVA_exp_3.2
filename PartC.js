CREATE DATABASE bank;
USE bank;

CREATE TABLE account (
  id INT PRIMARY KEY AUTO_INCREMENT,
  account_number VARCHAR(50),
  holder_name VARCHAR(100),
  balance DECIMAL(15,2)
);

package example.c;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name="account")
public class Account {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name="account_number", unique=true)
    private String accountNumber;

    @Column(name="holder_name")
    private String holderName;

    private BigDecimal balance;

    // constructors/getters/setters
    public Account() {}
    public Account(String accountNumber, String holderName, BigDecimal balance) {
        this.accountNumber = accountNumber; this.holderName = holderName; this.balance = balance;
    }

    public Integer getId(){ return id; }
    public String getAccountNumber(){ return accountNumber; }
    public BigDecimal getBalance(){ return balance; }
    public void setBalance(BigDecimal balance){ this.balance = balance; }
}
package example.c;

import org.hibernate.SessionFactory;
import org.springframework.stereotype.Repository;
import org.hibernate.Session;

@Repository
public class AccountDAO {
    private final SessionFactory sessionFactory;
    public AccountDAO(SessionFactory sessionFactory) { this.sessionFactory = sessionFactory; }

    public Account findById(Integer id) {
        Session s = sessionFactory.getCurrentSession();
        return s.get(Account.class, id);
    }

    public void update(Account account) {
        Session s = sessionFactory.getCurrentSession();
        s.update(account);
    }
}
package example.c;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;

@Service
public class BankService {
    private final AccountDAO accountDAO;
    public BankService(AccountDAO dao){ this.accountDAO = dao; }

    @Transactional
    public void transfer(Integer fromId, Integer toId, BigDecimal amount) {
        Account from = accountDAO.findById(fromId);
        Account to = accountDAO.findById(toId);

        if (from == null || to == null) throw new IllegalArgumentException("Account not found");
        if (from.getBalance().compareTo(amount) < 0) throw new IllegalArgumentException("Insufficient funds");

        from.setBalance(from.getBalance().subtract(amount));
        accountDAO.update(from);

        // simulate possible runtime failure to test rollback:
        // if (someCondition) throw new RuntimeException("Simulated failure");

        to.setBalance(to.getBalance().add(amount));
        accountDAO.update(to);
    }
}
package example.c;

import java.util.Properties;
import javax.sql.DataSource;
import org.hibernate.SessionFactory;
import org.springframework.context.annotation.*;
import org.springframework.orm.hibernate5.HibernateTransactionManager;
import org.springframework.orm.hibernate5.LocalSessionFactoryBean;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@ComponentScan("example.c")
@EnableTransactionManagement
public class SpringHibernateConfig {

    @Bean
    public DataSource dataSource() {
        DriverManagerDataSource ds = new DriverManagerDataSource();
        ds.setDriverClassName("com.mysql.cj.jdbc.Driver");
        ds.setUrl("jdbc:mysql://localhost:3306/bank?useSSL=false&serverTimezone=UTC");
        ds.setUsername("root");
        ds.setPassword("password");
        return ds;
    }

    @Bean
    public LocalSessionFactoryBean sessionFactory() {
        LocalSessionFactoryBean sf = new LocalSessionFactoryBean();
        sf.setDataSource(dataSource());
        sf.setPackagesToScan("example.c");
        Properties props = new Properties();
        props.put("hibernate.dialect", "org.hibernate.dialect.MySQL8Dialect");
        props.put("hibernate.show_sql", "true");
        props.put("hibernate.hbm2ddl.auto", "update"); // for dev
        sf.setHibernateProperties(props);
        return sf;
    }

    @Bean
    public HibernateTransactionManager transactionManager(SessionFactory sessionFactory) {
        HibernateTransactionManager tm = new HibernateTransactionManager();
        tm.setSessionFactory(sessionFactory);
        return tm;
    }
}

package example.c;

import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import java.math.BigDecimal;

public class RunTransfer {
    public static void main(String[] args) {
        try (AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext(SpringHibernateConfig.class)) {
            BankService bankService = ctx.getBean(BankService.class);

            // assume two accounts exist with ids 1 and 2
            try {
                bankService.transfer(1, 2, new BigDecimal("100.00"));
                System.out.println("Transfer successful");
            } catch (Exception e) {
                System.err.println("Transfer failed: " + e.getMessage());
            }
        }
    }
}
